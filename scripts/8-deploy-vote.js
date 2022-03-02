import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule(process.env.APP_ADDRESS);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "BIS Proposals",
      votingTokenAddress: process.env.TOKEN_ADDRESS,
      // After a proposal is created, when can members start voting?
      // 0 we set this to immediately.
      proposalStartWaitTimeInSeconds: 0,
      // How long do members have to vote on a proposal when it's created?
      // its now 24 hours
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      // A minimum %s of token must be used in the vote.
      votingQuorumFraction: 20,
      minimumNumberOfTokensNeededToPropose: "1",
    });

    console.log(
      "Successfully deployed vote module, address: ",
      voteModule.address
    );
  } catch (err) {
    console.error("Failed to deploy vote module", err);
  }
})();
