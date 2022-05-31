import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { AishiToken__factory, AishiToken } from "../typechain-types";

describe("AishiToken Test", function () {
  let signers: SignerWithAddress[];
  let aishiToken: AishiToken;
  let recipient: string;
  beforeEach(async () => {
    signers = await ethers.getSigners();
    aishiToken = await new AishiToken__factory(signers[0]).deploy();
    recipient = signers[1].address;
  });

  it("Should mint the Aishi NFT", async function () {
    const lockedFromTimestamp = Math.round(Date.now() / 1000) + 8;
    const unlockHash = utils.keccak256(
      utils.keccak256(utils.toUtf8Bytes("SecretCode"))
    );

    await aishiToken
      .connect(signers[0])
      .mintToken(recipient, lockedFromTimestamp, unlockHash);

    expect(await aishiToken.connect(signers[0]).balanceOf(recipient)).to.eq(1);
    expect(await aishiToken.connect(signers[0]).ownerOf(0)).to.eq(recipient);
  });

  it("Should unlockToken", async function () {
    const lockedFromTimestamp = Math.round(Date.now() / 1000) + 1;
    const unlockHash = utils.keccak256(
      utils.keccak256(utils.toUtf8Bytes("SecretCode"))
    );

    await aishiToken
      .connect(signers[0])
      .mintToken(recipient, lockedFromTimestamp, unlockHash);

    const tokenId = 0;
    await expect(
      aishiToken.connect(signers[1]).unlockToken(unlockHash, tokenId)
    ).to.not.reverted;
    expect(await aishiToken.tokenUnlocked(tokenId)).to.eq(true);
  });

  it("Should generate the tokenURI", async function () {
    const lockedFromTimestamp = Math.round(Date.now() / 1000) + 8;
    const unlockHash = utils.keccak256(
      utils.keccak256(utils.toUtf8Bytes("SecretCode"))
    );

    await aishiToken
      .connect(signers[0])
      .mintToken(recipient, lockedFromTimestamp, unlockHash);

    const tokenId = 0;
    const expectedTokenURI = `https://aisthisi.art/metadata/${tokenId}.json`;
    expect(await aishiToken.tokenURI(tokenId)).to.eq(expectedTokenURI);
  });

  it("Should emit Transfer when a new NFT is minted", async function () {
    const lockedFromTimestamp = Math.round(Date.now() / 1000) + 8;
    const unlockHash = utils.keccak256(
      utils.keccak256(utils.toUtf8Bytes("SecretCode"))
    );
    const tokenId = 0;

    await expect(
      aishiToken
        .connect(signers[0])
        .mintToken(recipient, lockedFromTimestamp, unlockHash)
    )
      .to.emit(aishiToken, "Transfer")
      .withArgs(ethers.constants.AddressZero, recipient, tokenId);
  });

  it("Should emit TokenUnlocked when a token is unlocked", async function () {
    const lockedFromTimestamp = Math.round(Date.now() / 1000) + 8;
    const unlockHash = utils.keccak256(
      utils.keccak256(utils.toUtf8Bytes("SecretCode"))
    );

    await aishiToken
      .connect(signers[0])
      .mintToken(recipient, lockedFromTimestamp, unlockHash);

    const tokenId = 0;
    await expect(
      aishiToken.connect(signers[1]).unlockToken(unlockHash, tokenId)
    )
      .to.emit(aishiToken, "TokenUnlocked")
      .withArgs(tokenId, recipient);
  });
});

// pause
// unpause
// ERC721PresetMinterPauserAutoId
// ERC721Enumerable,
// ERC721Burnable,
// ERC721Pausable
// ERC721

// Lazy minting