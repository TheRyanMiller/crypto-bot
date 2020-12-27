
import React from 'react';
import '../styles/App.css';
import '../styles/statstile.css';
import Auxx from '../hoc/auxx';

const performanceDataTile = (props) => {
    let tile = (<div className="content-row"></div>);
    let color = "dark";
    let productId = "";
    if(props.performanceData.productId==="totals"){
        color="white";
        props.performanceData.productId="TOTAL";
    }
    //if(props.order.productId) productId = props.order.productId.substring(0,props.order.productId.indexOf("-"))
    tile = (   
        <div onClick={props.click} className="master centerFlex">   
            <div className={color+" fontColor myrow "} onClick={props.click}>
                <div className="col1">
                    {props.performanceData.productId}
                </div>
                <div className="col2">
                    {"$"+props.performanceData.actualUsd.toFixed(2)}
                </div>

                <div className="col2">
                    {"$"+props.performanceData.adjustedUsd.toFixed(2)}
                </div>

                <div className="col3">
                    {"$"+props.performanceData.profit.toFixed(2)}
                </div>
            </div>
        </div>
    )
    return(
        <Auxx className="container" onClick={()=>console.log("xx")}> {tile} </Auxx>
    )
}

export default performanceDataTile;