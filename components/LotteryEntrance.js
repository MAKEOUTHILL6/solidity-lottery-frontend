import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const LotteryEntrance = () => {
    // returns chainId of the wallet current network
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chaindId = parseInt(chainIdHex);
    const raffleAddress = chaindId in contractAddresses ? contractAddresses[chaindId][0] : <></>;

    const [entranceFeeFromContract, setEntranceFeeFromContract] = useState(0);

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

    useEffect(() => {
        if (isWeb3Enabled) {
            async function updateUI() {
                const entranceFee = (await getEntranceFee()).toString();
                setEntranceFeeFromContract(entranceFee);
            }

            updateUI();
        }
    }, [isWeb3Enabled]);

    return (
        <>
            <div>
                <h1> Lottery Entrance </h1>
            </div>
            <div>
                {raffleAddress ? (
                    <>
                        <p>
                            Entrance Fee:{" "}
                            {ethers.utils.formatUnits(entranceFeeFromContract, "ether")} ETH
                        </p>
                        <button onClick={async () => {
                            await enterRaffle()
                        }}>Enter</button>
                    </>
                ) : (
                    <div>No Raffle Address Detected!</div>
                )}
            </div>
        </>
    );
};

export default LotteryEntrance;
