import React from 'react';
import PerformanceDataTile from './performanceDataTile';
import '../styles/App.css';

const performanceData = (props) => {
    let rows = props.performanceData.map((data,idx) => {
      return (
        <PerformanceDataTile performanceData={data} key={idx} />

      )
    })
    return(
      <div className="centerFlex">
        <div className="master centerFlex">
        <div className={"hrow"}>
          <div className="hcol3">Product</div>
            <div className="hcol3"><b>Actual Spend</b></div>
            <div className="hcol3"><b>Present Value</b></div>
            <div className="hcol3">Profit</div>
        </div>

        </div>
        {rows}
      </div>
    )
}

export default performanceData;