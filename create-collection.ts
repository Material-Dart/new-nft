import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getKeypairFromFile, airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, createNft, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 5 * LAMPORTS_PER_SOL, .5 * LAMPORTS_PER_SOL);

console.log("Loaded user: ", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, { mint: collectionMint, name: "Mr. Bülüç", symbol: "HB", uri: "https://raw.githubusercontent.com/Material-Dart/new-nft/refs/heads/main/metadata.json", sellerFeeBasisPoints: percentAmount(5), isCollection: true });
await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);

console.log(`Created Collection 📦! Address is ${getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")}`);