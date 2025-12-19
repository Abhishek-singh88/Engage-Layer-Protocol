import { Web3Provider } from './providers/Web3Provider';
import './globals.css';

export const metadata = {
  title: 'Engage Layer Protocol',
  description: 'Web3 engagement with Advanced Permissions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
