import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import Orders from './components/orders';
import Admin from './components/admin';
import About from './components/about';
import Register from './components/register';
import Login from './components/login';
import Config from './components/config';
import Profile from './components/profile';
import PrivateRoute from './components/PrivateRoute';
import AccountBalances from './components/accountBalances';
import { api } from "./apis/apiCalls";
import './styles/App.css';
import './styles/nav.css';

function App() {
  const [orders, setOrders] = useState([]);
  const [marketPrice, setMarketPrice] = useState(0);
  const [acctBalances, setAcctBalances] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() =>{
    if(localStorage.getItem("jwt-access-token")){
      api().get('/profile/getAllActiveConfigs').then((resp) => {
        console.log(resp)
        if(!!resp.data.data){ // In case no data exists in DB
            let allConfigs = resp.data.data;
            let products = [];
            allConfigs.forEach(c=>{
              products.push(c.id);
            })
        }
      }).catch(err=>console.log("Cannot get config.",err))
      if(selectedProduct) getMarketPrice(selectedProduct);
      getAccountBalances();
    }
  },[selectedProduct])

  useEffect(() =>{
    if(selectedProduct) getMarketPrice(selectedProduct);
  },[selectedProduct])

  const syncOrders = () => {
    setIsSyncing(true);
    api().post('/coinbase/syncOrders', {params: null}).then((resp) => {
      getOrders();
    })
    .catch(err=>{
      console.log(err);
      setIsSyncing(false);
    })
  }

  const getOrders = () => {
    api().get('/order/getAll').then((resp) => {
      try{
        setOrders(resp.data.data);
        setIsSyncing(false);
      }
      catch(err){
        console.log("Unable to set orders.",err)
      }
    }).catch(err=>console.log("Unable to get users orders.",err))
  }

  const getMarketPrice = (product) => {
    if(localStorage.getItem("jwt-access-token")){
      api().get('/coinbase/getMarketPrice', { params: { productId : product.id } }).then((resp) => {
        setMarketPrice(resp.data.data);
      }).catch(err=>console.log("Unable to get marketprice.",err))
    }
  }

  const getAccountBalances = () => {
    if(localStorage.getItem("jwt-access-token")){
      api().get('/coinbase/getAccountBalances').then((resp) => {
        setAcctBalances(resp.data.data);
      }).catch(err=>console.log("Unable to get account balances.",err))
    }
  }

  const HomeDisplay = () => {
    if(localStorage.getItem("jwt-access-token")){
      setIsLoggedIn(true);
    }
    return (
      <>
        <Config 
          selectedProduct={selectedProduct}
          handleNewProductSelect={handleNewProductSelect} />
      </>
    )
  }

  let handleNewProductSelect = (e) => {
    setSelectedProduct(e.value);
  }

  const OrdersDisplay = () => {
    return (
      <Orders
        orders={orders}
        getOrders={getOrders}
        syncOrders={syncOrders}
        isSyncing={isSyncing}
      />
    )
  }

  const ProfileDisplay = () => {
    return (
      <Profile
      />
    )
  }

  let accountBalances = () => {
    return (
      <AccountBalances 
        acctBalances={acctBalances} 
        activeProduct={selectedProduct} 
        marketPrice={marketPrice} />
    )
  }

  let nav = (
    <nav className="Nav">
          <ul>
            <li><NavLink exact activeStyle={{
                          fontWeight: "bold",
                          borderBottomColor: "rgb(74, 88, 146)",
                          borderBottomWidth: 2,
                          color: "rgb(238, 238, 238)"
                        }} to="/">Home</NavLink></li>
            <li><NavLink activeStyle={{
                          fontWeight: "bold",
                          borderBottomColor: "rgb(74, 88, 146)",
                          borderBottomWidth: 2,
                          color: "rgb(238, 238, 238)"
                        }} to="/orders">Orders</NavLink></li>
            <li><NavLink activeStyle={{
                          fontWeight: "bold",
                          borderBottomColor: "rgb(74, 88, 146)",
                          borderBottomWidth: 2,
                          color: "rgb(238, 238, 238)"
                        }} to="/admin">Admin</NavLink></li>
            <li><NavLink activeStyle={{
                          fontWeight: "bold",
                          borderBottomColor: "rgb(74, 88, 146)",
                          borderBottomWidth: 2,
                          color: "rgb(238, 238, 238)"
                        }} to="/profile">Profile</NavLink></li>
            <li><NavLink activeStyle={{
                          fontWeight: "bold",
                          borderBottomColor: "rgb(74, 88, 146)",
                          borderBottomWidth: 2,
                          color: "rgb(238, 238, 238)"
                        }} to="/about">About</NavLink></li>
          
          </ul>
    </nav>
  )

  let handleLogin = (valid) => {
    if(valid) {
      setIsLoggedIn(true);
      getAccountBalances();
      if(selectedProduct) getMarketPrice(selectedProduct);
    }
    else{
      setIsLoggedIn(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("jwt-access-token");
    localStorage.removeItem("jwt-refresh-token");
    setIsLoggedIn(false);
  }

  return (
    <Router>
    <div className="App center">
      <header className="App-header">
        { localStorage.getItem("jwt-access-token") ? nav : "" }
        { localStorage.getItem("jwt-access-token") ? accountBalances() : "" }
      </header>
          
          <PrivateRoute isAuthenticated={isLoggedIn} path="/" exact render={()=>HomeDisplay()} />
          <Route path="/register" exact render={Register} />
          <Route path="/login" exact render={ (props) => <Login {...props}  handleLogin={handleLogin} /> } />
          <PrivateRoute path="/orders" exact render={()=>OrdersDisplay()} />
          <PrivateRoute path="/profile" exact render={()=>ProfileDisplay()} />
          <Route path="/about" exact component={About} />
          <Route path="/admin" exact component={Admin} />
          <br /><br /><br />
      
      
    </div>
    </Router>
  );
}

export default App;