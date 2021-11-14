import React, { useState, useEffect } from "react";
import { tokenAbi } from "./CreatorTokenAbi";
const Moralis = require('moralis');
const CONTRACT_ADDRESS = "0x865eba652fec78746e794b5a870bdc6c3325292b";
const CHAIN = "mumbai";

export default function CreateItem() {
    const [imageUrl, setImageUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ 
      name: '', 
      description: '', 
      amountToCreator: '', 
      amountToPool: '', 
      cost: '' });
    
    
    async function onChange(e) {
        const data = e.target.files[0];
        try {
          const file = new Moralis.File(data.name, data);
          await file.saveIPFS();
          //console.log(file.ipfs(), file.hash());
          setImageUrl(file.ipfs());
        
          } catch (error) { 
            console.log('Error uploading file: ', error);
          }
        }

    const tokenToDb = async (name, description, imageUri) => {
        const TokenMetadata = Moralis.Object.extend("TokenMetadata");
        const tokenInfo = new TokenMetadata(); 

        const metadata = {
          "name": name,
          "description": description,
          "image": imageUri
        }

        const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
        await metadataFile.saveIPFS();

        // getting last token_id
        const query = new Moralis.Query(TokenMetadata);
        const results = await query.find();
        const token_id = results.length + 1;

        tokenInfo.set("token_id", token_id);
        tokenInfo.set("metadata_ipfs_url", metadataFile.ipfs());

        await tokenInfo.save();

    }    
        
    async function mintToken(tokenName, cost, amountToCreator, amountToPool, uri) {
      
      const web3 = await Moralis.enableWeb3();
      let accounts = await web3.eth.getAccounts();
      const tokenContract = new web3.eth.Contract(tokenAbi, CONTRACT_ADDRESS); 

      await tokenContract.methods.mint(
        tokenName,
        cost, 
        amountToCreator, 
        amountToPool, 
        uri)
        .send({from: accounts[0]});
      }
      
      async function createToken() {
          const web3 = new Moralis.Web3();
          let { name, description, amountToCreator, amountToPool, cost } = formInput
          if (!name || !description || !amountToCreator || !amountToPool || !cost || !imageUrl) return
    
          try {
              amountToCreator = web3.utils.toBN(amountToCreator);
              amountToPool = web3.utils.toBN(amountToPool);
              cost = web3.utils.toBN(cost);

              await mintToken(name, cost, amountToCreator, amountToPool, imageUrl);
              await tokenToDb(name, description, imageUrl);

          } catch (error) {
              console.log('Error uploading file: ', error)
          }  
      }

    return(<div>
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Your share of tokens"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, amountToCreator: e.target.value })}
        />
        <input
          placeholder="Public share of tokens"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, amountToPool: e.target.value })}
        />
        <input
          placeholder="Asset Price in Matic"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, cost: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          imageUrl && (
            <img className="rounded mt-4" width="350" src={imageUrl} />
          )
        }
        <button onClick={createToken} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create Token
        </button>
      </div>
    </div>
    
    </div>);
}