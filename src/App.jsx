import { useEffect, useMemo, useState } from "react";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";
import { ethers } from "ethers";
import { UnsupportedChainIdError } from "@web3-react/core";

const sdk = new ThirdwebSDK("rinkeby");
const bundleDropModule = sdk.getBundleDropModule(
  "0x42faD0A360e452e3fa709c1670DBb699Ce2BE0a7"
);
const tokenModule = sdk.getTokenModule(
  "0xa74c870D87cbB3232330e0a3898707bfB8784874"
);
const voteModule = sdk.getVoteModule(
  "0xeC200aAfD7037d70d4ae21592aaF5D8A71f8C659"
);

const tokenID = "0";

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address);

  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const shortenAddress = (str) =>
    `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;

  const getMemberAddresses = async () => {
    try {
      const memberAddresses = await bundleDropModule.getAllClaimerAddresses(
        tokenID
      );
      setMemberAddresses(memberAddresses);
      console.log("Members address", memberAddresses);
    } catch (error) {
      console.error("Failed to get member list", error);
    }
  };

  const getHolderBalances = async () => {
    try {
      const amounts = await tokenModule.getAllHolderBalances();
      setMemberTokenAmounts(amounts);
      console.log("Amounts", amounts);
    } catch (error) {
      console.error("Failed to get holder balances");
    }
  };

  const getBalance = async (address) => {
    const balance = await bundleDropModule.balanceOf(address, tokenID);
    try {
      if (balance.gt(0)) {
        setHasClaimedNFT(true);
        console.log("🌟 this user has a membership NFT!");
      } else {
        setHasClaimedNFT(false);
        console.log("😭 this user doesn't have a membership NFT.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    getMemberAddresses();
  }, [hasClaimedNFT]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    getHolderBalances();
  }, [hasClaimedNFT]);

  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    if (!address) {
      return;
    }

    getBalance(address);
  }, [address]);

  // Get all proposals
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getProposals = async () => {
      try {
        const proposals = await voteModule.getAll();
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      } catch (error) {
        console.error("Failed to get proposals", error);
      }
    };

    getProposals();
  }, [hasClaimedNFT]);

  // Check if the user already voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    if (!proposals.length) {
      return;
    }

    const checkVoted = async () => {
      try {
        const hasVoted = await voteModule.hasVoted(
          proposals[0].proposalId,
          address
        );
        setHasVoted(hasVoted);
      } catch (error) {
        console.error("Failed to check if wallet has voted", error);
      }
    };

    checkVoted();
  }, [hasClaimedNFT, proposals, address]);

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks in
          your connected wallet.
        </p>
      </div>
    );
  }
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to bisDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  const mintNft = async () => {
    setIsClaiming(true);
    try {
      await bundleDropModule.claim(tokenID, 1);
      setHasClaimedNFT(true);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
      );
    } catch (error) {
      console.error("failed to claim", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>BIS Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsVoting(true);
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    vote: 2,
                  };

                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      `${proposal.proposalId}-${vote.type}`
                    );
                    if (elem.checked) {
                      voteResult.vote = vote.type;
                    }
                  });

                  return voteResult;
                });

                // Make sure the user delegates their token to vote
                try {
                  const delegation = await tokenModule.getDelegationOf(address);
                  // has not delegated yet
                  if (delegation === ethers.constants.AddressZero) {
                    // delegate them before voting.
                    await tokenModule.delegateTo(address);
                  }

                  // Vote all proposals
                  await Promise.all(
                    votes.map(async (vote) => {
                      // Before voting need to check the proposal is open for voting.
                      // by getting latest state of proposal.
                      const proposal = await voteModule.get(vote.proposalId);
                      const open = 1;
                      if (proposal.state !== open) {
                        return;
                      }
                      return voteModule.vote(vote.proposalId, vote.vote);
                    })
                  );

                  await Promise.all(
                    votes.map(async (vote) => {
                      const proposal = await voteModule.get(vote.proposalId);
                      const readyForExecuted = 4;
                      if (proposal.state !== readyForExecuted) {
                        return;
                      }
                      return voteModule.execute(vote.proposalId);
                    })
                  );

                  setHasVoted(true);
                } catch (error) {
                  console.error(error);
                } finally {
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={`${proposal.proposalId}-${vote.type}`}
                          name={proposal.proposalId}
                          value={vote.type}
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={`${proposal.proposalId}-${vote.type}`}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                  ? "You already voted"
                  : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing">
      <h1>Mint your free BIS Membership NFT!</h1>
      <button disabled={isClaiming} onClick={() => mintNft()}>
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;
