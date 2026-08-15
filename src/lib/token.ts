export const TOKEN = {
  ticker: "$DINOVERSE",
  name: "The Dinoverse",
  chain: "Solana",
  ca: "CUTuufCBBFA4AwvB3LNwtPqZvCDEg25L9PsKSkx3pump",
  taxBuy: "0%",
  taxSell: "0%",
  supply: "1,000,000,000",
  lp: "Locked at launch",
  mint: "Revoked at launch",
  freeze: "Revoked at launch",
  tagline: "Bones are about to list. We built the city first.",
  blurb:
    "Real dinosaur fossils are heading on-chain. $DINOVERSE is the Solana ticket that got there early — a working HQ, a Floor Chief with a coffee, and a city you can walk while the rest of crypto is still googling Jurassic.",
  lore: [
    "For 65 million years the bones waited in stone. Now they are waiting on a contract. Museums, private vaults, and serious desks are lining up to tokenize real dinosaur fossils — provenance, custody, a market that will treat a T-rex like a treasury asset. When that window opens, dinosaurs stop being a costume and become a category.",
    "$DINOVERSE is the front-run. Not a whitepaper about bones. A Solana meme coin with a city that already clocks in: The Floor, Dino Mart, the Mega Mall, the Arena. Rex Volt walks the tape in a three-piece because the listing is a lifestyle, not a screenshot. You do not wait for the fossil IPO. You take the spiral stairs, buy the coffee, and live the meta while it is still an adventure.",
    "Fair launch. Zero tax. One billion supply. The bones are coming. The city is open.",
  ],
  x: "https://x.com/dinoversesol",
  telegram: "https://t.me/dinoverseonsol",
  buy: "https://dexscreener.com/solana/czvhuqbd6srmh3phfpxibfvpcfcyovxypammxxepm8hc",
  jupiter: "https://dexscreener.com/solana/czvhuqbd6srmh3phfpxibfvpcfcyovxypammxxepm8hc",
  raydium: "https://dexscreener.com/solana/czvhuqbd6srmh3phfpxibfvpcfcyovxypammxxepm8hc",
  phantom: "https://phantom.app/",
} as const;

export const TOKEN_STATS = [
  { k: "Chain", v: TOKEN.chain },
  { k: "Ticker", v: TOKEN.ticker },
  { k: "Tax", v: `${TOKEN.taxBuy} / ${TOKEN.taxSell}` },
  { k: "Supply", v: TOKEN.supply },
] as const;

export const TOKENOMICS = [
  { k: "Total supply", v: TOKEN.supply, d: "Fixed. No stealth mints after the window opens." },
  { k: "Buy / sell tax", v: `${TOKEN.taxBuy} / ${TOKEN.taxSell}`, d: "Zero tax. The floor does not skim the tape." },
  { k: "LP", v: TOKEN.lp, d: "Liquidity locked when the listing goes live." },
  { k: "Mint & freeze", v: "Revoked", d: `${TOKEN.mint}. ${TOKEN.freeze}.` },
] as const;

export const BUY_STEPS = [
  {
    n: "01",
    title: "Wallet",
    body: "Install Phantom or any Solana wallet. This is a Solana listing — EVM wallets will not see the tape.",
    href: TOKEN.phantom,
    cta: "Get Phantom",
  },
  {
    n: "02",
    title: "Fund SOL",
    body: "Bridge or buy SOL. Keep a little extra for fees. The Floor does not run on IOUs.",
  },
  {
    n: "03",
    title: "Open DexScreener",
    body: "Open the $DINOVERSE chart. Confirm the pair, then swap from there. Check the ticker before you sign.",
    href: TOKEN.buy,
    cta: "Open DexScreener",
  },
  {
    n: "04",
    title: "Swap",
    body: "SOL in. $DINOVERSE out. Then look at The Floor in 3D — the city is the product, not a whitepaper.",
  },
] as const;

export const ROADMAP = [
  {
    phase: "00",
    title: "Front-run the bone market",
    when: "Now",
    body: "The fossil tokenization wave is coming. We built the city first. The Floor is a live 3D preview. Rex holds the cuff.",
  },
  {
    phase: "01",
    title: "The listing window",
    when: "Live",
    body: "Fair launch on Solana. LP locked. Mint and freeze revoked. $DINOVERSE is the ticker on a city that already works.",
  },
  {
    phase: "02",
    title: "Walk the floors",
    when: "Next",
    body: "First-person HQ, then Dino Mart, the Mega Mall, and the Arena. Utility is a place you can stand, not a slide.",
  },
  {
    phase: "03",
    title: "Live the meta",
    when: "After",
    body: "Coffee, combos, gym time, and Coliseum seats in $DINOVERSE. When the bones list, we are already on the floor.",
  },
] as const;

export const FAQS = [
  {
    q: "What is $DINOVERSE?",
    a: "A Solana meme coin built to front-run the dinosaur meta. Real fossils are heading on-chain. We turned that into a city you can walk — coffee, The Floor, Dino Mart, the mall, the Coliseum — with Rex Volt on the tape.",
  },
  {
    q: "Why dinosaurs?",
    a: "Because the bones are next. Tokenized fossils, museum provenance, private collections — a serious market is lining up. $DINOVERSE is the fun way to be early: live the adventure now, instead of waiting for a whitepaper about a T-rex in a vault.",
  },
  {
    q: "When does it launch?",
    a: `Live on Solana. CA ${TOKEN.ca}. Copy it from this site or open the DexScreener chart before you swap.`,
  },
  {
    q: "Is there tax?",
    a: "0% buy, 0% sell. If someone quotes a tax, they are not on our floor.",
  },
  {
    q: "Where do I buy?",
    a: "Phantom (or any Solana wallet) → DexScreener → swap $DINOVERSE. Use the chart link on this site so you land on the live pair.",
  },
  {
    q: "What can I do on the site now?",
    a: "Orbit The Floor in 3D. Read the city plates. Walking HQ, Dino Mart, the Mall, and the Arena are under construction.",
  },
] as const;
