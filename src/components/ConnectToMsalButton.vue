<template>
    <div>
        <v-btn class="test" @click="loginPopup()">Connect to Smal</v-btn>
        
        <!-- <v-btn @click="loginRedirect()">Connect to Smal</v-btn> -->
    </div>
     
</template>

<script>
import  Msal  from "../msalConfig";
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
        console.log(Msal.msalInstance)
        Msal.msalInstance.acquireTokenSilent(Msal.loginRequest).then(tokenResponse => {
    // Do something with the tokenResponse
    console.log("here is response ", tokenResponse)
}).catch(error => {
    if (error instanceof InteractionRequiredAuthError) {
        // fallback to interaction when silent call fails
        return msalInstance.acquireTokenRedirect(Msal.loginRequest)
    }

    // handle other errors
});

      // Call loginPopup after msalInstance is initialized
      Msal.msalInstance.loginPopup(Msal.loginRequest)
        .then(response => {
          // Handle successful login
          console.log('Login successful:', response);
          const token = response.accessToken;
                    const user = response.account;
                    localStorage.setItem("authId", token);
                    localStorage.setItem("user", user?.name);
                    this.$router.push({
                        name: "Editor",
                        params: { id: this.user }
                    });
                    
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
