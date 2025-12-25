// app/lib/contract.ts
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "rewardPerAction", "type": "uint256" }],
    "name": "createCampaign",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "contentUri", "type": "string" },
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" }
    ],
    "name": "createPost",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "contentUri", "type": "string" },
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "string[]", "name": "options", "type": "string[]" }
    ],
    "name": "createPoll",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "postId", "type": "uint256" }],
    "name": "likePost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "postId", "type": "uint256" },
      { "internalType": "uint8", "name": "optionIndex", "type": "uint8" }
    ],
    "name": "voteOnPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "redeemPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "posts",
    "outputs": [
      { "internalType": "address", "name": "author", "type": "address" },
      { "internalType": "string", "name": "contentUri", "type": "string" },
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "uint256", "name": "likeCount", "type": "uint256" },
      { "internalType": "uint256", "name": "totalVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "postId", "type": "uint256" }],
    "name": "getPollOptions",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "text", "type": "string" },
          { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
        ],
        "internalType": "struct EngageLayerProtocol.PollOption[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "points",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextPostId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "hasLiked",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "hasVoted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "contentUri", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "campaignId", "type": "uint256" }
    ],
    "name": "PostCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "pointsEarned", "type": "uint256" }
    ],
    "name": "Liked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "optionIndex", "type": "uint8" },
      { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "pointsEarned", "type": "uint256" }
    ],
    "name": "Voted",
    "type": "event"
  }
] as const;