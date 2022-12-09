import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

const LotteryEntrance = () => {
    // returns chainId of the wallet current network
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chaindId = parseInt(chainIdHex);
    const raffleAddress = chaindId in contractAddresses ? contractAddresses[chaindId][0] : <></>;

    const dispatch = useNotification();

    const [entranceFeeFromContract, setEntranceFeeFromContract] = useState("0");
    const [numPlayers, setNumPlayers] = useState(0);
    const [recentWinner, setRecentWinner] = useState(0);

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFeeFromContract,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    async function updateUI() {
        const entranceFee = (await getEntranceFee()).toString();
        const numPlayersFromCall = (await getNumberOfPlayers()).toString();
        const winner = await getRecentWinner();
        setNumPlayers(numPlayersFromCall);
        setEntranceFeeFromContract(entranceFee);
        setRecentWinner(winner);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const handleSucess = async (tx) => {
        await tx.wait(1);
        handleNewNotif(tx);
        updateUI();
    };

    const handleNewNotif = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        });
    };

    return (
        <>
            <div>
                <h1> Lottery Entrance </h1>
            </div>
            <div>
                <h1>Current players: {numPlayers}</h1>
                <h1>Recent winner: {recentWinner}</h1>
            </div>
            <div>
                {raffleAddress ? (
                    <>
                        <p>
                            Entrance Fee:{" "}
                            {ethers.utils.formatUnits(entranceFeeFromContract, "ether")} ETH
                        </p>
                        <button
                            onClick={async () => {
                                await enterRaffle({
                                    onSuccess: handleSucess,
                                    onError: (error) => console.log(error),
                                });
                            }}
                        >
                            Enter
                        </button>
                    </>
                ) : (
                    <div>No Raffle Address Detected!</div>
                )}
            </div>
        </>
    );
};

export default LotteryEntrance;
