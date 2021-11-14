
// when fetching from cloud

// import Moralis from "moralis/types";
import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { tokenAbi } from "./CreatorTokenAbi";
import { appId, serverUrl } from "./index";
const Moralis = require('moralis');
const CONTRACT_ADDRESS = "0x57b3537183749706ced798e81cf1715e56180867";
const CHAIN = "mumbai";


const fetchNFTMetadata = async (NFTs) => {
  let promises = [];
  for (let i = 0; i < NFTs.length; i++) {
    let nft = NFTs[i];
    let id = nft.token_id;
    promises.push(fetch(serverUrl + "/functions/getNFT?_ApplicationId=" + appId + "=" + id)
    .then(res => res.json())
    .then(res => JSON.parse(res.result))
    .then(res => {nft.metadata = res})
    .then(res => {
      const options = { address: CONTRACT_ADDRESS, chain: CHAIN };
      return Moralis.Web3API.token.getNFTOwners(options);
    })
    .then(res => {
      nft.owners = [];
      res.result.forEach(element => {
          console.log(element.owner_of);
          nft.owners.push(element.owner_of);
      });
      return nft;
    }))
  }
  return Promise.all(promises);
}

function RenderInventory(props) {

  const [Amount, setAmount] = useState(0);
  const token_id = props.token_id;
  // console.log(token_id);


  function handleChange(event) {
    const newValue = event.target.value;
    setAmount(newValue);
  }


  return (<div>
            <div class="card">
                <img src={props.image} class="card-img-top" alt="..." />
                <div class="card-body">
                  <h5 class="card-title">name: {props.name}</h5>
                  <p class="card-text">description: {props.description}</p>
                  <p class="card-text">amount: {props.amount}</p>
                  <p class="card-text">Owners Count: {props.length}</p>

                  <div className="form">
                    <input onChange={handleChange} type="text" value={Amount} />
                    <button
                      onClick={() => {
                        props.mint(token_id, Amount);
                        setAmount(0);
                      }}
                    >
                      <span>Mint</span>
                    </button>
                  </div>
                </div>
            </div>

  </div>);
}


const Home = () => {
  const { authenticate, isAuthenticated, user, logout } = useMoralis();
  const [NFTWithMetadata, setNFTWithMetadata] = useState([]);
  
  async function buyToken(token_id, Amount) {
    const web3 = await Moralis.enableWeb3();
    let accounts = await web3.eth.getAccounts();
    const tokenContract = new web3.eth.Contract(tokenAbi, CONTRACT_ADDRESS); 
    const cost = await tokenContract.methods.costOfTokenInWei(token_id).call();
    console.log(cost);
    await tokenContract.methods.buyTokens(token_id, Amount).send({from: accounts[0], value: cost*Amount});
  }
  
  useEffect(() => {
    async function getMetadata() {
      const options = { address: CONTRACT_ADDRESS, chain: CHAIN };
      const NFTs = await Moralis.Web3API.token.getAllTokenIds(options);
      // let data = await fetchNFTMetadata(NFTs.result);
      // setNFTWithMetadata(prevData => {    
      //   return [...prevData, ...data];
      // });
    };
    
    

    getMetadata();
    
  }, []);

  
  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={() => authenticate({ signingMessage: "Hello World!" })}>Authenticate</button>
      </div>
    );
  }
console.log(NFTWithMetadata);
  return (
    
    <div>

      <h1>Welcome {user.get("username")}</h1>
      <button onClick={() => logout()}>Logout</button> 




      {NFTWithMetadata.map((item, index) => (
        <RenderInventory
          key={index}
          id={index}
          image={item.metadata.image}
          name={item.metadata.name}
          description={item.metadata.description}
          amount={item.metadata.amount}
          length={item.owners.length}
          token_id={item.token_id}
          mint={buyToken}
        />
      ))}
      
    </div>
  );
};

export default Home;