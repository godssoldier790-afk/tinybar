# Tinybar

Live HBAR tracker with a verified-asset registry across chains.

Tinybar shows the canonical Hedera native token, official wrappers, and which networks have **no** verified HBAR. Price, chart, council nodes, and exchange tape come from the Hedera mirror node plus public market APIs.

## Palette

| Color | Use |
| --- | --- |
| Blue | Official / brand / actions |
| Green | Live, up, 24h high |
| Yellow | Related / caution |
| Red | Down, 24h low, lookalikes |

## What to try

- Check live HBAR / USD and the 1D–1Y chart
- Paste a token ID or `0x` address in **Verify**
- Filter **Chains** for verified HBAR vs none
- Open **Network** for supply, TPS, and council nodes
- Compare **Venues** against the mid price

## Stack

TanStack Start, React 19, Tailwind v4, TanStack Query, Recharts.

Not financial advice. Verify contracts before you transact.
