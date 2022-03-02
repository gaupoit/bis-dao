import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(process.env.TOKEN_ADDRESS);

(async () => {
  try {
    console.log(
      "Roles that exist right now",
      await tokenModule.getAllRoleMembers()
    );
    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
    console.log(
      "Successfully revoked our superpowers from the ERC-20 contract"
    );
    console.log(
      "Roles that exist after revoke",
      await tokenModule.getAllRoleMembers()
    );
  } catch (error) {
    console.error("Failed to revoke ourselves form the DAO treasury", error);
  }
})();
