import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getKeypairFromFile, airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, createNft, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, generateSigner, percentAmount, publicKey } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 5 * LAMPORTS_PER_SOL, .5 * LAMPORTS_PER_SOL);

console.log("Loaded user: ", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey("ERBAiU72ckxj3ima54x2JYEuTX66abegzGb9UQNDjDPy");

console.log("Creating NFT...");

const mint = generateSigner(umi);

const transaction = await createNft(umi, { mint, name: "Samsung Galaxy S24+", uri: "", sellerFeeBasisPoints: percentAmount(5), collection: { key: collectionAddress, verified: false } });

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(`🖼️ Created NFT! Address is ${getExplorerLink("address", createdNft.mint.publicKey, "devnet")}`);
console.log(`Name: ${createdNft.metadata.name}`);
console.log(`Symbol: ${createdNft.metadata.symbol}`);
console.log(`URI: ${createdNft.metadata.uri}`);