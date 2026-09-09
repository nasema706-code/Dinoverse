export const TOKEN = {
  ticker: "$DINOVERSE",
  name: "The DinoVerse",
  tokenName: "Dino Universe",
  chain: "Solana",
  dex: "PumpSwap",
  ca: "CUTuufCBBFA4AwvB3LNwtPqZvCDEg25L9PsKSkx3pump",
  taxBuy: "0%",
  taxSell: "0%",
  decimals: 6,
  supply: "957,027,168.351375",
  supplyShort: "957,027,168",
  supplyWas: "1,000,000,000",
  lp: "Reported 100% locked",
  mint: "Revoked",
  freeze: "Revoked",
  kicker: "Independent Solana meme universe",
  headline: "The bones went on-chain.",
  headlineTwo: "The dinosaurs never left.",
  tagline: "The bones went on-chain. The dinosaurs never left.",
  blurb:
    "Humans believed dinosaurs disappeared 65 million years ago. The dinosaurs were happy to let them believe it. Welcome to The DinoVerse: an independent Solana meme universe inspired by dinosaur fossil tokenisation on-chain.",
  independence:
    "Independent project. Not affiliated with or endorsed by Jurassic Finance, Solana, the Solana Foundation or Anatoly Yakovenko.",
  usDisclosure:
    "$DINOVERSE is an independent, speculative meme token created for entertainment, cultural participation and community engagement. It does not represent equity, debt, revenue rights, fossil ownership or any interest in Jurassic Finance, $TRCH1, $RAWR or a fossil SPV. Its value is determined by market demand and may fall to zero. No profit, yield, price appreciation or financial return is promised.",
  disclaimer:
    "$DINOVERSE is a speculative memecoin and may lose all its value. It is not a share, fossil-backed asset or claim against Jurassic Finance. This website is provided for information and entertainment and is not financial advice.",
  taxNote:
    "A 0% token transfer tax does not mean trading is free. Solana network fees, PumpSwap fees, platform charges and price slippage may still apply.",
  lockAmount: "151,930,204.648219",
  lockShare: "15.88%",
  lockUnlock: "21 September 2026 · 04:00 UTC",
  x: "https://x.com/dinoversesol",
  telegram: "https://t.me/dinoverseonsol",
  buy: "https://dexscreener.com/solana/d4ej9orc39h6yjyglhppamjtncxkn4ty6fyn3vnbkyqp",
  dexscreener: "https://dexscreener.com/solana/d4ej9orc39h6yjyglhppamjtncxkn4ty6fyn3vnbkyqp",
  solscan: "https://solscan.io/token/CUTuufCBBFA4AwvB3LNwtPqZvCDEg25L9PsKSkx3pump",
  streamflow:
    "https://app.streamflow.finance/token-dashboard/solana/mainnet/CUTuufCBBFA4AwvB3LNwtPqZvCDEg25L9PsKSkx3pump",
  jurassic: "https://jurassic.finance/",
  jupiter: "https://jup.ag/swap/SOL-CUTuufCBBFA4AwvB3LNwtPqZvCDEg25L9PsKSkx3pump",
  raydium: "https://dexscreener.com/solana/d4ej9orc39h6yjyglhppamjtncxkn4ty6fyn3vnbkyqp",
  phantom: "https://phantom.app/",
} as const;

export const TOKEN_STATS = [
  { k: "Network", v: TOKEN.chain },
  { k: "DEX", v: TOKEN.dex },
  { k: "Tax", v: TOKEN.taxBuy },
  { k: "Supply", v: TOKEN.supplyShort },
] as const;

export const TOKENOMICS = [
  { k: "Token name", v: TOKEN.tokenName, d: `Ticker ${TOKEN.ticker} on ${TOKEN.chain}.` },
  { k: "On-chain supply", v: TOKEN.supply, d: `Previously shown as ${TOKEN.supplyWas}. Verify live on Solscan.` },
  { k: "Token transfer tax", v: `${TOKEN.taxBuy} / ${TOKEN.taxSell}`, d: TOKEN.taxNote },
  { k: "Mint & freeze", v: "Revoked", d: "Mint authority revoked. Freeze authority revoked." },
  { k: "Decimals", v: String(TOKEN.decimals), d: `Primary ${TOKEN.ticker}/SOL market on ${TOKEN.dex}.` },
  { k: "Liquidity", v: TOKEN.lp, d: "Verify the current lock on the live chart. Do not rely only on this page." },
] as const;

export const BUY_STEPS = [
  {
    n: "01",
    title: "Wallet",
    body: "Install Phantom or any Solana wallet. $DINOVERSE is a Solana token — EVM wallets will not see it.",
    href: TOKEN.phantom,
    cta: "Get Phantom",
  },
  {
    n: "02",
    title: "Fund SOL",
    body: "Bridge or buy SOL. Keep a little extra for network fees. The Floor does not run on IOUs.",
  },
  {
    n: "03",
    title: "Confirm the CA",
    body: "Open Solscan or DexScreener and match the contract on this page before you sign anything.",
    href: TOKEN.solscan,
    cta: "Verify on Solscan",
  },
  {
    n: "04",
    title: "Swap on PumpSwap",
    body: "SOL in. $DINOVERSE out. Use the live DexScreener pair so you land on the PumpSwap market.",
    href: TOKEN.dexscreener,
    cta: "View live chart",
  },
] as const;

export const FAQS = [
  {
    q: "Is DinoVerse part of Jurassic Finance?",
    a: "No. DinoVerse is an independent Solana meme universe and entertainment project. It is inspired by dinosaur fossil tokenisation. It is not affiliated with or endorsed by Jurassic Finance, Solana, the Solana Foundation or Anatoly Yakovenko.",
  },
  {
    q: "Does $DINOVERSE represent ownership of Deaton?",
    a: "No. $DINOVERSE provides no legal, economic or beneficial ownership of Deaton or any other fossil. According to Jurassic Finance, Deaton is represented separately through that project's own SPV structure — not through this token.",
  },
  {
    q: "What is $TRCH1?",
    a: "According to Jurassic Finance, $TRCH1 is the separate Solana token associated with the Deaton fossil SPV. It is not connected to the $DINOVERSE contract. See jurassic.finance.",
  },
  {
    q: "What is $RAWR?",
    a: "According to Jurassic Finance, $RAWR is part of that project's own ecosystem. Holding $DINOVERSE does not provide $RAWR, Jurassic Finance governance rights or participation in its treasury.",
  },
  {
    q: "What is $DINOVERSE for?",
    a: "$DINOVERSE is a speculative meme token for entertainment, cultural participation and community engagement around original characters, a live game and a 3D city. Current experiences include this website, the 3D Floor preview and Mushroom Run. No token purchase is required to play. No profit, yield, price appreciation or financial return is promised.",
  },
  {
    q: "Where can I verify the token?",
    a: `Use the contract address ${TOKEN.ca} and verify it independently on DexScreener and Solscan.`,
  },
] as const;

/** Specimen and tokenisation claims below are according to Jurassic Finance, not DinoVerse. */
export const DEATON = [
  "Approximately 66 million years old",
  "60–65% complete by original bone mass",
  "All three original horns present",
  "Represented separately by $TRCH1",
  "One-million stated $TRCH1 supply",
  "660,000 USDC acquisition and coordination target",
] as const;

export const JURASSIC_SOURCES = [
  {
    label: "Jurassic Finance",
    href: "https://jurassic.finance/",
    note: "Primary source for SPV, SPL, authentication, custody, Deaton and $TRCH1 claims on this website.",
  },
] as const;

export const TREASURY_WALLETS: { label: string; address: string; note: string }[] = [];

export const ALLOCATION_POLICY = [
  {
    k: "On-chain supply",
    v: TOKEN.supply,
    d: `Previously shown as ${TOKEN.supplyWas}. Verify the live figure on Solscan before you rely on it.`,
  },
  {
    k: "Streamflow lock",
    v: `${TOKEN.lockAmount} (${TOKEN.lockShare})`,
    d: `Non-cancellable, non-transferable lock. Fully claimable by the developer wallet on ${TOKEN.lockUnlock}.`,
  },
  {
    k: "Circulating remainder",
    v: "About 84.12%",
    d: "Treated as circulating unless a labelled wallet or additional lock is published. Confirm holders on Solscan.",
  },
  {
    k: "Liquidity",
    v: TOKEN.lp,
    d: `Primary ${TOKEN.ticker}/SOL market on ${TOKEN.dex}. Verify the current lock on DexScreener rather than this page alone.`,
  },
  {
    k: "Post-unlock policy",
    v: "Not yet published",
    d: `What happens to the locked allocation after ${TOKEN.lockUnlock} should be published here before that date. Until then, do not assume burns, re-locks or treasury transfers.`,
  },
  {
    k: "Play and access",
    v: "No purchase required",
    d: "Mushroom Run, the Floor preview and this website do not require a $DINOVERSE purchase.",
  },
] as const;
