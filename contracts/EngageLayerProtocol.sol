// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EngageLayerProtocol {

    struct Campaign {
        address creator;
        uint256 budget;          // remaining native token budget (in wei)
        uint256 rewardPerAction; // reward per engagement action (like/vote) in wei
        bool active;
    }

    struct Post {
        address author;
        string contentUri;   // e.g., IPFS or HTTPS URL
        uint256 campaignId;  // 0 if no campaign
        uint256 likeCount;
        uint256 totalVotes;
        uint256 createdAt;
    }

    struct PollOption {
        string text;
        uint256 voteCount;
    }

    uint256 public nextCampaignId = 1;
    uint256 public nextPostId = 1;

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Post) public posts;

    // Post ID => option index => PollOption
    mapping(uint256 => PollOption[]) public pollOptions;

    // Post ID => user => liked?
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    // Post ID => user => has voted?
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Simple points ledger per user
    mapping(address => uint256) public points;

    // Admin address (optional, can be creator or contract deployer)
    address public owner;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 budget,
        uint256 rewardPerAction
    );

    event CampaignFunded(
        uint256 indexed campaignId,
        uint256 amount
    );

    event CampaignStatusUpdated(
        uint256 indexed campaignId,
        bool active
    );

    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string contentUri,
        uint256 campaignId
    );

    event Liked(
        uint256 indexed postId,
        address indexed user,
        uint256 reward,
        uint256 pointsEarned
    );

    event Voted(
        uint256 indexed postId,
        address indexed user,
        uint8 optionIndex,
        uint256 reward,
        uint256 pointsEarned
    );

    event PointsRedeemed(
        address indexed user,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Create a new campaign with initial funding.
    /// @param rewardPerAction Reward (in wei) per like/vote.
    function createCampaign(uint256 rewardPerAction) external payable returns (uint256) {
        require(msg.value > 0, "No initial budget");
        require(rewardPerAction > 0, "Reward must be > 0");
        require(msg.value >= rewardPerAction, "Budget < reward");

        uint256 campaignId = nextCampaignId;
        nextCampaignId++;

        campaigns[campaignId] = Campaign({
            creator: msg.sender,
            budget: msg.value,
            rewardPerAction: rewardPerAction,
            active: true
        });

        emit CampaignCreated(campaignId, msg.sender, msg.value, rewardPerAction);
        return campaignId;
    }

    /// @notice Fund an existing campaign with more native tokens.
    function fundCampaign(uint256 campaignId) external payable {
        Campaign storage c = campaigns[campaignId];
        require(c.creator != address(0), "Campaign not found");
        require(msg.value > 0, "No value sent");
        c.budget += msg.value;

        emit CampaignFunded(campaignId, msg.value);
    }

    /// @notice Activate or deactivate a campaign.
    function setCampaignStatus(uint256 campaignId, bool active_) external {
        Campaign storage c = campaigns[campaignId];
        require(c.creator == msg.sender || msg.sender == owner, "Not authorized");
        c.active = active_;

        emit CampaignStatusUpdated(campaignId, active_);
    }

/// @notice Create a post optionally tied to a campaign.
/// @param contentUri IPFS hash or HTTPS URL.
/// @param campaignId ID of campaign or 0 for no campaign.
function createPost(string calldata contentUri, uint256 campaignId) external returns (uint256) {
    return _createPost(msg.sender, contentUri, campaignId);
}

/// @notice Create a poll post with options (tied to optional campaign).
function createPoll(
    string calldata contentUri,
    uint256 campaignId,
    string[] calldata options
) external returns (uint256) {
    require(options.length >= 2, "Need at least 2 options");

    uint256 postId = _createPost(msg.sender, contentUri, campaignId);

    PollOption[] storage opts = pollOptions[postId];
    for (uint256 i = 0; i < options.length; i++) {
        opts.push(PollOption({text: options[i], voteCount: 0}));
    }

    return postId;
}

/// @dev Internal helper to create a post
function _createPost(
    address author,
    string calldata contentUri,
    uint256 campaignId
) internal returns (uint256) {
    if (campaignId != 0) {
        Campaign storage c = campaigns[campaignId];
        require(c.creator != address(0), "Campaign not found");
        require(c.active, "Campaign not active");
    }

    uint256 postId = nextPostId;
    nextPostId++;

    posts[postId] = Post({
        author: author,
        contentUri: contentUri,
        campaignId: campaignId,
        likeCount: 0,
        totalVotes: 0,
        createdAt: block.timestamp
    });

    emit PostCreated(postId, author, contentUri, campaignId);
    return postId;
}


    /// @notice Like a post (only once per user).
    ///         If post has a campaign, user may receive native reward + points.
    function likePost(uint256 postId) external {
        Post storage p = posts[postId];
        require(p.author != address(0), "Post not found");
        require(!hasLiked[postId][msg.sender], "Already liked");

        hasLiked[postId][msg.sender] = true;
        p.likeCount += 1;

        (uint256 reward, uint256 pts) = _handleEngagementReward(p.campaignId, msg.sender);

        emit Liked(postId, msg.sender, reward, pts);
    }

    /// @notice Vote on a poll option (only once per user).
    function voteOnPost(uint256 postId, uint8 optionIndex) external {
        Post storage p = posts[postId];
        require(p.author != address(0), "Post not found");
        require(!hasVoted[postId][msg.sender], "Already voted");

        PollOption[] storage opts = pollOptions[postId];
        require(opts.length > 0, "Not a poll");
        require(optionIndex < opts.length, "Invalid option");

        hasVoted[postId][msg.sender] = true;

        opts[optionIndex].voteCount += 1;
        p.totalVotes += 1;

        (uint256 reward, uint256 pts) = _handleEngagementReward(p.campaignId, msg.sender);

        emit Voted(postId, msg.sender, optionIndex, reward, pts);
    }

    /// @dev Internal helper to handle native reward + points.
    function _handleEngagementReward(
        uint256 campaignId,
        address user
    ) internal returns (uint256 reward, uint256 pts) {
        reward = 0;
        pts = 1; // base points per engagement

        // Always give at least 1 point
        points[user] += pts;

        if (campaignId != 0) {
            Campaign storage c = campaigns[campaignId];
            if (c.active && c.budget >= c.rewardPerAction && c.rewardPerAction > 0) {
                reward = c.rewardPerAction;
                c.budget -= reward;

                // send native token reward
                (bool sent, ) = user.call{value: reward}("");
                if (!sent) {
                    // if transfer fails, refund to campaign budget and skip reward
                    c.budget += reward;
                    reward = 0;
                }
            }
        }
    }

    /// @notice Redeem points for off-chain perks (just burns them on-chain).
    ///         In MVP, no on-chain reward; off-chain system can verify event.
    function redeemPoints(uint256 amount) external {
        require(points[msg.sender] >= amount, "Not enough points");
        points[msg.sender] -= amount;

        emit PointsRedeemed(msg.sender, amount);
    }

    function getPollOptions(uint256 postId)
        external
        view
        returns (PollOption[] memory)
    {
        return pollOptions[postId];
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    // Fallback to accept native token
    receive() external payable {}
}
