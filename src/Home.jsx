// import Moralis from "moralis/types";
import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { tokenAbi } from "./CreatorTokenAbi";
import { appId, serverUrl } from "./index";
const Moralis = require('moralis');
const CONTRACT_ADDRESS = "0x865eba652fec78746e794b5a870bdc6c3325292b";
const CHAIN = "mumbai";


const fetchNFTMetadata = async () => {
  const query = new Moralis.Query("TokenMetadata");
  const NFTs = await query.find();
  // console.log(results[0].attributes.metadata_ipfs_url);
  // fetch(results[0].attributes.metadata_ipfs_url)
  // .then(res => res.json())
  // .then(res => JSON.stringify(res))
  // .then(res =>{ 
  //   let obj = JSON.parse(res);
  //   obj.token_id = results[0].attributes.token_id
  //   console.log(obj)}) //JSON.parse

  let promises = [];
  for (let i = 0; i < NFTs.length; i++) {
    let nft = NFTs[i];
    let id = nft.attributes.token_id;
    promises.push(fetch(nft.attributes.metadata_ipfs_url)
    .then(res => res.json())
    .then(res => JSON.stringify(res))
    .then(res => { 
    let obj = JSON.parse(res);
    obj.token_id = id;
    return obj}))
  }
  return Promise.all(promises);
}

function RenderInventory(props) {

  const [Amount, setAmount] = useState(0);
  const token_id = props.token_id;

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
      // await fetchNFTMetadata();
      let data = await fetchNFTMetadata();
      setNFTWithMetadata(prevData => {    
        return [...prevData, ...data];
      });
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
          image={item.image}
          name={item.name}
          description={item.description}
          token_id={item.token_id}
          mint={buyToken}
        />
      ))}
      
    </div>
  );
};

export default Home;