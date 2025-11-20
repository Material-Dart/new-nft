import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getKeypairFromFile, airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, createNft, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 5 * LAMPORTS_PER_SOL, .5 * LAMPORTS_PER_SOL);

console.log("Loaded user: ", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionMint = generateSigner(umi);

console.log("Creating collection NFT...");
console.log("Collection address:", collectionMint.publicKey);

const transaction = await createNft(umi, { mint: collectionMint, name: "Mr. Bülüç", symbol: "HB", uri: "https://raw.githubusercontent.com/Material-Dart/new-nft/refs/heads/main/nft-collection-offchain-data.json", sellerFeeBasisPoints: percentAmount(5), isCollection: true });
const result = await transaction.sendAndConfirm(umi, { confirm: { commitment: "finalized" } });

console.log("Transaction confirmed:", result);

try {
    const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);

    console.log(`Created Collection 📦! Address is ${getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")}`);
    console.log(`Name: ${createdCollectionNft.metadata.name}`);
    console.log(`Symbol: ${createdCollectionNft.metadata.symbol}`);
    console.log(`URI: ${createdCollectionNft.metadata.uri}`);
} catch (error) {
    console.error("Error fetching digital asset:", error);
    console.log(`Collection created but fetch failed. Address: ${collectionMint.publicKey}`);
    console.log(`Explorer: ${getExplorerLink("address", collectionMint.publicKey, "devnet")}`);
}