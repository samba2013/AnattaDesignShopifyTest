import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';
const { SHOPIFY_ADMIN_SHOP, SHOPIFY_ADMIN_ACCESS_TOKEN } = process.env;
import { parseArgs } from 'node:util';
import https from 'https';


// Configure input args
const options = {
    name: {
      type: 'string',
      short: 'n',
    }
  
  };
  
  const { values, positionals } = parseArgs({ options });
  
const productSearchName = values.name; // product name input search
  

// Method 1: Using Shopify API directly using Fetch

const shopifyAdminGqlEndpoint = `https://${SHOPIFY_ADMIN_SHOP}.myshopify.com/admin/api/2025-01/graphql.json`;



const runQueryWithPagination = (query,variables)=>{

    // Make a GraphQL request to Shopify
    fetch(shopifyAdminGqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify({ gqlQuery }),
    agent: httpsAgent
  })
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => console.error('Error fetching products:', error));

}


const getProductsByName = (productName)=>{
    console.log(`Looking for products with name : ${productName}`);
    // Getting Products by input variable : name
    const gqlQuery = `
      {
        products(first: 10, query: "title: '${productName}'") {
          pageInfo{
            endCursor
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              title
              variantsCount
            }
          }
        }
      }
    `;

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
    
    
};


  

