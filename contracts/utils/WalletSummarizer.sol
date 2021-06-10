// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


struct Account {
    uint256 etherBalance;
    TokenSummary[] tokenSummaries;
}


struct TokenQuery {
    ERC20Interface token;
    address[] spenders;
}


struct TokenSummary {
    bool balanceCheckSuccess;
    uint256 balance;
    AllowanceCheck[] allowances;
}


struct AllowanceCheck {
    bool allowanceCheckSuccess;
    uint256 allowance;
}


interface ERC20Interface {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}


interface WalletSummarizerInterface {
    function summarize(TokenQuery[] calldata tokenQueries) external view returns (
        Account memory accountSummary
    );
    function summarizeAccounts(
        TokenQuery[] calldata tokenQueries, address[] calldata accounts
    ) external view returns (Account[] memory accountSummaries);
}


/// Quickly check the Ether balance, as well as the balance of each
/// supplied ERC20 token and a set of approved allowances, for an account or a
/// collection of accounts.
/// @author 0age
contract WalletSummarizer is WalletSummarizerInterface {
    function summarize(
        TokenQuery[] calldata tokenQueries
    ) external view override returns (Account memory) {
        Account memory accountSummary;
        bool success;
        bytes memory returnData;

        TokenSummary[] memory tokenSummaries = new TokenSummary[](tokenQueries.length);

        for (uint256 i = 0; i < tokenQueries.length; i++) {
            TokenSummary memory tokenSummary;
            TokenQuery memory tokenQuery = tokenQueries[i];
            ERC20Interface token = tokenQuery.token;
            (success, returnData) = address(token).staticcall{gas: gasleft() / 4}(
                abi.encodeWithSelector(token.balanceOf.selector, msg.sender)
            );

            if (success && returnData.length >= 32) {
                tokenSummary.balanceCheckSuccess = true;
                tokenSummary.balance = abi.decode(returnData, (uint256));
            }

            address[] memory spenders = tokenQuery.spenders;
            AllowanceCheck[] memory allowances = new AllowanceCheck[](spenders.length);
            for (uint256 j = 0; j < spenders.length; j++) {
                AllowanceCheck memory allowanceCheck;
                address spender = spenders[j];
                (success, returnData) = address(token).staticcall{gas: gasleft() / 4}(
                    abi.encodeWithSelector(token.allowance.selector, msg.sender, spender)
                );

                if (success && returnData.length >= 32) {
                    allowanceCheck.allowanceCheckSuccess = true;
                    allowanceCheck.allowance = abi.decode(returnData, (uint256));
                }
                allowances[j] = allowanceCheck;
            }

            tokenSummary.allowances = allowances;

            tokenSummaries[i] = tokenSummary;
        }

        accountSummary.etherBalance = msg.sender.balance;
        accountSummary.tokenSummaries = tokenSummaries;

        return accountSummary;
    }

    function summarizeAccounts(
        TokenQuery[] calldata tokenQueries, address[] calldata accounts
    ) external view override returns (Account[] memory) {
        Account[] memory accountSummaries = new Account[](accounts.length);

        bool success;
        bytes memory returnData;
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];

            TokenSummary[] memory tokenSummaries = new TokenSummary[](tokenQueries.length);

            for (uint256 j = 0; j < tokenQueries.length; j++) {
                TokenSummary memory tokenSummary;
                TokenQuery memory tokenQuery = tokenQueries[j];
                ERC20Interface token = tokenQuery.token;
                (success, returnData) = address(token).staticcall{gas: gasleft() / 4}(
                    abi.encodeWithSelector(token.balanceOf.selector, account)
                );

                if (success && returnData.length >= 32) {
                    tokenSummary.balanceCheckSuccess = true;
                    tokenSummary.balance = abi.decode(returnData, (uint256));
                }

                address[] memory spenders = tokenQuery.spenders;
                AllowanceCheck[] memory allowances = new AllowanceCheck[](spenders.length);
                for (uint256 k = 0; k < spenders.length; k++) {
                    AllowanceCheck memory allowanceCheck;
                    address spender = spenders[k];
                    (success, returnData) = address(token).staticcall{gas: gasleft() / 4}(
                        abi.encodeWithSelector(token.allowance.selector, account, spender)
                    );

                    if (success && returnData.length >= 32) {
                        allowanceCheck.allowanceCheckSuccess = true;
                        allowanceCheck.allowance = abi.decode(returnData, (uint256));
                    }
                    allowances[k] = allowanceCheck;
                }

                tokenSummary.allowances = allowances;

                tokenSummaries[j] = tokenSummary;
            }

            accountSummaries[i].etherBalance = account.balance;
            accountSummaries[i].tokenSummaries = tokenSummaries;
        }

        return accountSummaries;
    }
}