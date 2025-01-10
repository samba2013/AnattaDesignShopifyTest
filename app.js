import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';
const { SHOPIFY_ADMIN_SHOP, SHOPIFY_ADMIN_ACCESS_TOKEN } = process.env;
import { parseArgs } from 'node:util';

// Configure input args
const options = {
    name: {
      type: 'string',
      short: 'n',
    }
  
  };
  
  const { values, positionals } = parseArgs({ options });
  


// Method 1: Using Shopify API directly using Fetch
const shopifyAdminGqlEndpoint = `https://${SHOPIFY_ADMIN_SHOP}/admin/api/2025-01/graphql.json`;


// ########################## FUNCTIONS REGION
const runQueryWithPagination = async(query,variables)=>{
  let payload = {
    query: query,
    variables: variables
  };

  let hasNextPage = true;
  let data = {};
  let result = null;
  let cursor = null;
  let maxRetries = 5;

  while(hasNextPage && maxRetries >0){
      
    if(cursor){
      payload.variables.endCursor = cursor;
    }
      result = await fetch(shopifyAdminGqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
          },
          body: JSON.stringify(payload),
        })
          .then(response => response.json())
          .catch(error => {
            console.error('Error fetching products:', error)
            return null;
          });

 
      if(result === null) break;
      hasNextPage = result.data.products.pageInfo.hasNextPage;
      if(cursor === result.data.products.pageInfo.endCursor){
        maxRetries--; // prevent infinite loop
        continue;
      }


      cursor = result.data.products.pageInfo.endCursor;
      result.data.products.edges.forEach((edge,index)=>{
          data[edge.node.id]={
            id:edge.node.id,
            title: edge.node.title,
            variants: edge.node.variants.nodes
          }
      });
      
      await sleep(1500); // sleep 1.5 seconds before next page
  }
  return data;

}


const getProductsByName = async(productName)=>{
  // Getting Products by input variable : name
  const gqlQuery = `
    query ($productSearchQuery: String!, $endCursor: String){
      products(first: 10, query: $productSearchQuery, after: $endCursor) {
        pageInfo{
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            title
            variants(first: 100){
              nodes{
                id
                title
                price
              }
            }
          }
        }
      }
    }
  `;

  const products = await runQueryWithPagination(gqlQuery,
      {
      'productSearchQuery':`title:${productName}*`
      }
    );
  // sort by variant price :
  // because variants connection doesn't have sortKey for price sorting, i'll do it manually
  const productIds  = Object.keys(products);
  if(productIds.length){
    const flattenVariants = [];
    productIds.forEach((gid,index)=>{
      products[gid].variants.forEach((variantNode,index)=>{
        flattenVariants.push(
          {
            variantTitle: variantNode.title,
            price: variantNode.price,
            productTitle: products[gid].title
          }
        )
      });
    });
    // Sort by price (ascending)
    flattenVariants.sort((a, b) => a.price - b.price);

    console.log("Output:");
    flattenVariants.forEach(data => {
      console.log(`${data.productTitle} - ${data.variantTitle} - price $${data.price}`);
    });
  }else{
    console.log(`Oops! no products found`);
  }

  
  
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
  
// ######################### END FUNCTION REGION



// ######################### Main execution
const productSearchName = values.name; // product name input search
if(productSearchName == undefined)  {
  console.log(`Product name to search for is required!`);
  process.exit();
}
getProductsByName(productSearchName);




