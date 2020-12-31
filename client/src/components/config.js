import React, { useState, useEffect } from 'react';
import Switch from "react-switch";
import { isValidCron } from 'cron-validator';
import '../styles/config.css';
import '../styles/spinner.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faPencilAlt, faClock, faCheck, faPercent, faExclamation,faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-responsive-modal';
import DatesPreview from './datesPreview';
import Form from 'react-bootstrap/Form';
import {Formik, Field } from 'formik';
import { api } from "../apis/apiCalls";
import ReactTooltip from "react-tooltip";
import Select, { components } from 'react-select';
let cronParser = require('cron-parser');

const Config = (props) =>{
    const [editMode, setEditMode] = useState(false);
    const [saveErrorMsg, setSaveErrorMsg] = useState("");
    const [saveError, setSaveError] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [botEnabled, setBotEnabled] = useState(false);
    const [buyType, setBuyType] = useState("limit");
    const [cronValue, setCronValue] = useState("1 1 1 1 1");
    const [buySize, setBuySize] = useState(10);
    const [limitOrderDiff, setLimitOrderDiff] = useState(1);
    const [configId, setConfigId] = useState("");
    const [nextCronDates, setNextCronDates] = useState([]);
    const [showDatesModal, setShowDatesModal] = useState(false);
    const [productOptions, setProductOptions] = useState([]);
    const [defaultOption, setDefaultOption] = useState("");
    const [minBuyAmt, setMinBuyAmt] = useState(0)

    let minBuySize = 10;

    const divStyle = {
        fontSize: "14px",
        color: "white",
        textAlign: "left"
    }

    const divStyle2 = {
        fontSize: "20px",
        color: "white"
    }

    const feedbackStyle = {
        maxWidth: "250px",
        display: "block"
    }

    const fixedWidth = {
        maxWidth: "250px",
        width: "250px"
    }

    const closeDatesModal = () =>{
        setShowDatesModal(false)
    }
    
    const clickShowDatesModal= (order) => {
        setShowDatesModal(true);
    }

    useEffect(() =>{
        getProductOptions();
    },[]);

    

    useEffect(() =>{
        if(defaultOption){
            getConfig(defaultOption.id);
            props.handleNewProductSelect({value: defaultOption});
        }
    },[defaultOption]);
            
    useEffect(() =>{
        setIsFetching(true);
        if(props.selectedProduct) getConfig(props.selectedProduct.id);
    },[props.selectedProduct]);

    const getConfig = (productid) => {
        if(!!productid){
            api().get('/profile/getConfig',{ params: {product:productid}}).then((resp) => {
                if(!!resp.data.data){ // In case no data exists in DB
                    let config = resp.data.data;
                    api().get('/coinbase/getMarketPrice', { params: { productId : productid } }).then((resp) => {
                        let marketPrice = Number(resp.data.data);
                        let minBuySize = Number(config.product.base_min_size);
                        let tempMinBuyAmt = 10 > (marketPrice * minBuySize) ? 10 : (marketPrice * minBuySize);
                        setMinBuyAmt(tempMinBuyAmt);
                    }).catch(err=>console.log("Unable to get marketprice.",err))
                    setBotEnabled(config.botEnabled);
                    setCronValue(config.cronValue);
                    setBuySize(config.buySize);
                    setBuyType(config.buyType);
                    setLimitOrderDiff(config.limitOrderDiff);
                    setConfigId(config._id);
                    setBuyDates(config.cronValue);
                }
                setIsFetching(false);
            }).catch(err=>console.log("Cannot get config.",err))
        }
    }

    const setBuyDates = (value) => {
        let cronOptions = {
            currentDate: new Date(),
            tz: 'America/New_York'
        };
        let nextDate;
        let buyDates = [];
        for(let x=0;x<10;x++){
            nextDate = cronParser.parseExpression(value , cronOptions).next();
            buyDates.push(nextDate.toString());
            cronOptions = {
                currentDate: nextDate,
                tz: "America/New_York"//process.env.REACT_APP_TIMEZONE
            };
        }
        setNextCronDates(buyDates);
    }

    const saveChanges = (config) => new Promise(function(resolve, reject) {
        config.id = props.selectedProduct.id;
        api().post('/profile/saveConfig', { params: config}).then((resp) => {
            //We need to get the response and fill the values
            if(resp.data.success===false){
                console.log("ERROR SAVE ",resp.data)
                setSaveErrorMsg(resp.data.error.errmsg);
                setSaveError(true);
            }
            else{
                setEditMode(false);
                setSaveErrorMsg("");
                setSaveError(false);
                setSaveSuccess(false);
            }
            setSaveErrorMsg("Save successful!");
            setSaveSuccess(true);
            resolve(resp.data.data);
        })
    })

    let unsavedChanges = (
        <span style={{color: "rgb(253, 203, 37)"}}>
            <FontAwesomeIcon className={"nowrap fas "} icon={faExclamation} />  
            <span>  You have unsaved changes.</span>
        </span>
    )

    let saveErrorFeedback = (
        <span style={{color: "red"}}> 
            <FontAwesomeIcon className={"nowrap fas "} icon={faExclamationTriangle} /> 
            {saveErrorMsg ? saveErrorMsg : ""}
        </span>
    )

    let saveSuccessFeedback = (
        <span style={{color: "green"}}> 
            <FontAwesomeIcon className={"nowrap fas "} icon={faCheck} /> 
            {saveSuccess ? saveErrorMsg : ""}
        </span>
    )
    
    const toBase64 = (arr) => {
        let newArr = new Uint8Array(arr);
        return btoa(
            newArr.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
    }

    const noConfigs = (
        <div style={divStyle2}>
            <br /><br />
            To get started, please select some products from the <a href="/admin">admin page</a>.
        </div>
    )
    const getProductOptions = () => {
        api().get('/profile/getAllActiveConfigs').then((resp) => {
            if(!!resp.data.data){ // In case no data exists in DB
                let allConfigs = resp.data.data;
                let options = [];
                let convertedImg;
                setIsFetching(false);
                if(allConfigs.length===0){
                    setProductOptions(options);
                }
                let count = 0;
                let defaultExists = false;
                allConfigs.forEach(c=>{
                    count++;
                    if(c.icon){
                        convertedImg = "data:image/png;base64,"+toBase64(c.icon.data.data);
                    }
                    else{
                        convertedImg ="";
                    }
                    options.push({value:c, label:c.id, icon:convertedImg});
                    if(c && c.isDefault && c.isDefault===true){
                        defaultExists=true;
                        setDefaultOption(c);
                    } 
                    if(!defaultExists && allConfigs.length === count) setDefaultOption(c);
                })
                setProductOptions(options);
            }
        }).catch(err=>console.log("Cannot get config.",err))
    }

    const customStyles = {
        control: (base, state) => ({
          ...base,
          color: "white",
          background: "#212529",
          borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
          borderColor: state.isFocused ? "white" : "gray",
          // Removes weird border around container
          boxShadow: state.isFocused ? null : null,
          "&:hover": {
            // Overwrittes the different states of border
            borderColor: state.isFocused ? "white" : "gray"
          }
        }),
        option: (base, state) => ({
            ...base,
            color: "white",
            backgroundColor: state.isFocused ? "#212529" : "#212529",
            borderRadius: 0,
            background: "#212529",
            marginTop: 0
          }),
        menu: base => ({
          ...base,
          color: "white",
          borderRadius: 0,
          background: "#212529",
          marginTop: 0
        }),
        menuList: base => ({
          ...base,
          color: "white",
          background: "#212529",
          padding: 0,
        }),
        valueContainer: base => ({
          ...base,
          color: "white",
          background: "#212529",
          padding: 0
        }),
        singleValue: base => ({
            ...base,
            color: "white",
            background: "#212529",
            padding: 0
          })
      };

    const { Option } = components;
    const customSingleValue = selectprops => {
        return (
            <div className="input-select">
                <span className="input-select__icon">
                    <img
                        src={selectprops.data.icon}
                        style={{ width: 20, height: 20, marginRight: 10, marginLeft: 10 }}
                        alt=""
                    />
                    { selectprops.data.label }
                </span>
            </div>
        );
    }

    const customOption = selectprops => (
        <Option {...selectprops}>
            <span className="input-select__icon">
                <img
                    src={selectprops.data.icon}
                    style={{ width: 24, height: 24, marginRight: 10, marginLeft: 10}}
                    alt=""
                />
                { selectprops.data.label }
            </span>
        </Option>
    );

    let configLayout = (
        <div className="centerFlex" >
            <div className="fontColor center topRoom" style={divStyle}>
            <br />
            <Select 
                options={productOptions} 
                components={{
                    SingleValue: customSingleValue, 
                    Option: customOption 
                }}
                onChange={props.handleNewProductSelect} 
                styles={customStyles}
                width="150px"
                isSearchable={ false }
                value={{
                    label: props.selectedProduct ? props.selectedProduct.id : defaultOption.id,
                    icon: props.selectedProduct && props.selectedProduct.icon ? "data:image/png;base64,"+toBase64(props.selectedProduct.icon.data.data) :
                        "data:image/png;base64,"+toBase64(defaultOption.icon)
                }}
                className="selectBox"
                placeholder="Select an option" />
            </div>
            <div className="fontColor center" style={divStyle}>
            <Formik
                initialValues={{
                    id: configId,
                    botEnabled: botEnabled,
                    buyType: buyType ? buyType : "limit",
                    buySize: buySize ? buySize : 0,
                    limitOrderDiff: limitOrderDiff ? limitOrderDiff : "",
                    cronValue:cronValue ? cronValue : "1 1 1 1 1"
                }}
                enableReinitialize={true}
                validate={(values) => {
                    const errors = {};
                    var numbers = /^\d*(\.\d+)?$/;
                    //!values.buySize.match(numbers) || 
                    if (!values.buySize.toString().match(numbers) || values.buySize < Number(minBuyAmt).toFixed(2)){
                        errors.buySize = "Numbers only. Must be greater than $"+Number(minBuyAmt).toFixed(2)+"."
                    }
                    if (!values.limitOrderDiff.toString().match(numbers) || values.limitOrderDiff <= 0){
                        errors.limitOrderDiff = "Numbers only. Must be greater than 0%"
                    }
                    
                    if(!isValidCron(values.cronValue)){
                        errors.cronValue = "Invalid cron entry. Visit https://crontab.guru/ for help.";
                    }
                    return errors;
                }}
                validateOnBlur={true}
            >   
                {({ values, dirty, errors, setFieldValue, handleChange, setSubmitting, isSubmitting, handleSubmit, isValid }) => (
                    
                    <div className="center" style={fixedWidth}> 
                        <br />
                            <span><b>{values.botEnabled ? "ENABLED" : "DISABLED"}</b></span><br />
                        <Field className="topRoomLess"
                            onChange={(e)=>{
                                setFieldValue("botEnabled", !values.botEnabled);
                            }}
                            disabled={!editMode}
                            type="checkbox" checked={values.botEnabled} name="botEnabled" error={errors} as={Switch}
                        /><br /><br />
                        <div className="input-group mb-3 " data-tip="Add a dollar amount <br> you'd like to purchase">
                            <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon1">
                                <FontAwesomeIcon className={"nowrap fas "} icon={faDollarSign}/>  
                                
                            </span>
                            </div>
                            <Field 
                                disabled={!editMode} 
                                
                                type="number" isValid={false} 
                                isInvalid={!!errors.buySize} name="buySize" error={errors} onChange={handleChange} as={Form.Control}
                            />
                            
                        </div>
                        <ReactTooltip multiline={true} />
                        <Form.Control.Feedback style={feedbackStyle} type="invalid">
                                {errors.buySize}<br />
                        </Form.Control.Feedback>
                        
                        
                        <div className="input-group mb-3" data-tip="Crontab syntax is used to<br>schedule buy intervals">
                            <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon1">
                                <FontAwesomeIcon className={"nowrap fas danger"} icon={faClock} />  
                            </span>
                            </div>
                            <Field 
                                disabled={!editMode}
                                type="input"
                                isInvalid={!!errors.cronValue} name="cronValue" error={errors} onChange={handleChange} as={Form.Control}
                            />                     
                        </div>
                            <Form.Control.Feedback style={feedbackStyle} type="invalid">
                                {errors.cronValue} <br />
                            </Form.Control.Feedback>
                        <div><a href="#" onClick={clickShowDatesModal}>Preview next 10 orders...</a></div> 
                        
                            <div className="input-group mb-3 centerFlex" data-tip="Specify order type.">
                            <Form.Check inline
                                disabled={!editMode} 
                                name="buyType"
                                type="radio"
                                value="market"
                                label="Market"
                                checked={values.buyType==="market"}
                                onChange={handleChange}
                            />
                            <Form.Check inline
                                disabled={!editMode} 
                                name="buyType"
                                type="radio"
                                value="limit"
                                label="Limit"
                                checked={values.buyType==="limit"}
                                onChange={handleChange}
                            />
                        </div>
                        

                        <div className="input-group mb-3" style={{display: values.buyType==="market" ? "none" : ""}}
                            data-tip="Set percentage by which<br> order should undercut <br>current market price"
                            >
                            <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon1">
                                <FontAwesomeIcon className={"nowrap fas "} icon={faPercent} />  
                            </span>
                            </div>
                            <Field 
                                disabled={!editMode}
                                type="number" step="0.1" isValid={false} 
                                isInvalid={!!errors.limitOrderDiff} name="limitOrderDiff" error={errors} onChange={handleChange} as={Form.Control}
                            />
                            
                        </div>
                        <Form.Control.Feedback style={feedbackStyle} type="invalid">
                                {errors.limitOrderDiff} <br />
                        </Form.Control.Feedback>

                        <div className="" style={fixedWidth}>
                        
                        { saveError ? saveErrorFeedback : ""}
                        { dirty && !saveError ? unsavedChanges : ""}
                        { saveSuccess ? saveSuccessFeedback : ""}
                        <br />
                        <Button variant="primary" className="fiveSpace"  style={{display: editMode ? "none" : ""}}
                            onClick={()=>{
                                setEditMode(!editMode);
                                setSaveSuccess(false);
                            }}> 
                            <FontAwesomeIcon className="far" icon={ faPencilAlt } />
                            <span>      Edit</span> 
                        </Button>
                        
                        <Button variant="primary" className="fiveSpace" style={{display: dirty ? "" : "none"}} disabled={isSubmitting} 
                            type="submit" onClick={()=>{
                                if(Object.keys(errors).length===0){
                                saveChanges(values).then((data)=>{
                                    if(data){
                                        setBotEnabled(data.botEnabled);
                                        setBuyType(data.buyType)
                                        setCronValue(data.cronValue);
                                        setBuySize(data.buySize);
                                        setLimitOrderDiff(data.limitOrderDiff);
                                        setConfigId(data._id);
                                        setBuyDates(data.cronValue);
                                        setIsFetching(false);
                                    }
                                    setSubmitting(false);
                                });
                                }
                            }}> Save Changes </Button>
                        <Button variant="light" className="fiveSpace" style={{display: editMode ? "" : "none"}}
                            onClick={()=>{
                                setEditMode(!editMode);
                                setFieldValue("botEnabled",botEnabled);
                                setFieldValue("buySize",buySize);
                                setFieldValue("limitOrderDiff",limitOrderDiff);
                                setFieldValue("cronValue",cronValue);
                                setSaveError(false);
                                setSaveErrorMsg("");
                            }}> Cancel </Button></div>
                        
                        {/* <pre style={divStyle}>values: {JSON.stringify(values, null, 2)}</pre>
                        <pre style={divStyle}>errors: {JSON.stringify(errors, null, 2)}</pre> */}
                        
                    </div>
                    
                )}
                
                
            </Formik>
            <Modal
                open={showDatesModal}
                onClose={closeDatesModal}
                classNames={{
                    overlay: "customOverlay",
                    modal: "customModal"
                }}
            >   
                <strong>Next 10 scehduled buys...</strong>
                <br /><br />
                <DatesPreview buyDates={nextCronDates} />
            </Modal>
            
            <br />
            </div>
        </div>
    )

    let spinner = (<div className="loader">Loading...</div>)

  return isFetching ? spinner : productOptions.length===0 ? noConfigs : configLayout;

}

export default Config;
