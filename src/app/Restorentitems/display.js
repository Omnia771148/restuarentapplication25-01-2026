'use client'
export function ProductCard({ name, price,  symbol }) {


  return (
    <div className="product-card">
      <div className="productcard">
        <h3 className="producttitle">{name}</h3>
        <p className="symbol">{symbol}</p>
        <p className="productprice">₹{price}</p>
       
      </div>
    </div>
  );
}
