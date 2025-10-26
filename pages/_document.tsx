import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Allen Jorgio Sample Management System - Streamline your textile manufacturing workflow with QR code integration, inventory tracking, and automated packing slip generation."
        />
        <meta name="keywords" content="textile, manufacturing, sample management, QR code, inventory, packing slip, Allen Jorgio" />
        <meta name="author" content="Allen Jorgio" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
