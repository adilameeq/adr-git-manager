<template>
    <div>
        <v-btn class="test" @click="loginPopup()">Connect to Smal</v-btn>
        
        <!-- <v-btn @click="loginRedirect()">Connect to Smal</v-btn> -->
    </div>
     
</template>

<script>
import  Msal  from "../msalConfig";
import { LogLevel, PublicClientApplication } from "@azure/msal-browser";


// import { msalConfig, PublicClientApplication } from "../plugins/msalConfig";

export default {
  name: "connectMsal",
  data: () => ({
    user: null,
    repositories: []
  }),
  async mounted() {
    // Initialize msalInstance here
    // const msalInstance = new PublicClientApplication(Msal.msalConfig);
    // await msalInstance.initialize()
    // console.log(msalInstance)
    
  },
  methods: {
    loginPopup() {
      // Call loginPopup after msalInstance is initialized
      Msal.msalInstance.loginPopup(Msal.loginRequest)
        .then(response => {
          // Handle successful login
          console.log('Login successful:', response);
        })
        .catch(error => {
          // Handle login error
          console.error('Login error:', error);
        });
    },
    loginRedirect() {
      // Call loginRedirect after msalInstance is initialized
      Msal.msalInstance.loginRedirect(Msal.loginRequest)
        .then(response => {
          // Handle successful login
          console.log('Login successful:', response);
        })
        .catch(error => {
          // Handle login error
          console.error('Login error:', error);
        });
    }
  }
};

</script>
<style>
.test{
    margin-top: 10px;
}
</style>
