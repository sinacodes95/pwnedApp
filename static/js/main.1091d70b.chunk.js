(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{102:function(e,a){},104:function(e,a){},139:function(e,a){},140:function(e,a){},186:function(e,a,t){"use strict";t.r(a);var n=t(0),l=t.n(n),c=t(85),s=t.n(c),r=(t(95),t(189)),i=function(){return l.a.createElement("nav",{className:"nav-wrapper"},l.a.createElement("div",{className:"container"},l.a.createElement("h5",{className:"brand-logo left"},"';-- Have i Been Pwned?"),l.a.createElement("ul",{className:"right"},l.a.createElement("li",null,l.a.createElement(r.a,{to:"/pwnedApp"},"Home")),l.a.createElement("li",null,l.a.createElement(r.a,{to:"/Email"},"Email")),l.a.createElement("li",null,l.a.createElement(r.a,{to:"/Password"},"Password")),l.a.createElement("li",null,l.a.createElement(r.a,{to:"/Login"},"Login")))))},o=function(){return l.a.createElement("div",{className:"container center-align"},l.a.createElement("div",{className:"row"},l.a.createElement("div",{className:"col s6 l6"},l.a.createElement("div",{className:"card"},l.a.createElement("span",{className:"card-title"},"Email"),l.a.createElement("div",{className:"card-content"},l.a.createElement("p",null,"Click below to check if you have an account that has been compromised in a data breach at any point. We will show you what we find.")),l.a.createElement("div",{className:"card-action"},l.a.createElement(r.a,{to:"/Email"},"click Here")))),l.a.createElement("div",{className:"col s6 m6"},l.a.createElement("div",{className:"card"},l.a.createElement("span",{className:"card-title"},"Password"),l.a.createElement("div",{className:"card-content"},l.a.createElement("p",null,"Pwned Passwords are 551,509,767 real world passwords previously exposed in data breaches. Click below to see if your Password was one of them.")),l.a.createElement("div",{className:"card-action"},l.a.createElement(r.a,{to:"/Password"},"click here"))))))},m=t(89),d=t(18),u=t(19),E=t(21),p=t(20),h=t(22),f=function(e){function a(){var e;return Object(d.a)(this,a),(e=Object(E.a)(this,Object(p.a)(a).call(this))).emailInput=function(a){e.setState({emailInput:a.target.value})},e.splitEmails=function(e){return(e=e.replace(/\s/g,"")).match(/,/g)?e.split(","):[e]},e.getBreachedEmails=function(){e.setState({isLoading:!0,emailOutput:[],emailNotFound:""});var a=e.state.emailInput;a.length?(a=e.splitEmails(a)).forEach(function(t){a.length&&fetch("https://intense-spire-63761.herokuapp.com/api/email/".concat(t)).then(function(e){return e}).then(function(e){return e.json()}).then(function(e){return JSON.parse(e)}).then(function(e){return e.email=t,e}).then(function(a){return e.setState({isLoading:!1,emailOutput:[].concat(Object(m.a)(e.state.emailOutput),[a])})}).catch(function(a){a&&e.setState({isLoading:!1,emailNotFound:"".concat(e.state.emailNotFound,",").concat(t)})})}):e.setState({isLoading:!1})},e.closeCard=function(){e.setState({emailNotFound:""})},e.state={emailInput:"",emailOutput:[],emailNotFound:"",isLoading:!1},e}return Object(h.a)(a,e),Object(u.a)(a,[{key:"render",value:function(){var e=this.state,a=e.emailOutput,t=e.emailNotFound,n=e.isLoading;return l.a.createElement("div",{className:"container"},l.a.createElement("div",{className:"row"},l.a.createElement("div",{className:"col s12 m4"},l.a.createElement("div",{className:"card grey darken-1"},l.a.createElement("div",{className:"card-content white-text"},l.a.createElement("span",{className:"card-title"},"Email"),l.a.createElement("p",null,"Enter your email address below to check if it was compromised in a data breach."),l.a.createElement("p",null,"You may also enter a list of comma separated emails to check multiple accounts."),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("div",{className:"row"},l.a.createElement("form",{className:"col s12"},l.a.createElement("div",{className:"row"},l.a.createElement("div",{className:"input-field col s11 m11"},l.a.createElement("i",{className:"material-icons prefix"},"mail"),l.a.createElement("textarea",{onChange:this.emailInput,id:"icon_prefix2",className:"materialize-textarea"}),l.a.createElement("label",{htmlFor:"icon_prefix2"},"Enter email")))))),l.a.createElement("div",{className:"card-action"},l.a.createElement("button",{className:"waves-effect waves-teal btn-flat",onClick:this.getBreachedEmails,type:"link"},"SEARCH",l.a.createElement("i",{className:"material-icons right"},"send"))))),l.a.createElement("div",{className:"col s12 m8"},n?l.a.createElement("div",{className:"progress"},l.a.createElement("div",{className:"indeterminate"})):a.length?a.map(function(e,a){return l.a.createElement("div",{key:a,className:"white-text"},l.a.createElement("h3",null,e.email,l.a.createElement("i",{className:"material-icons prefix"},"do_not_disturb")),l.a.createElement("table",null,l.a.createElement("thead",null,l.a.createElement("tr",{className:"red darken-1"},l.a.createElement("th",null,"Name"),l.a.createElement("th",null,"Domain"),l.a.createElement("th",null,"Breach Date"),l.a.createElement("th",null,"Pwnd Count"))),e.Breaches.map(function(e,a){return l.a.createElement("tbody",{key:a},l.a.createElement("tr",null,l.a.createElement("td",null,e.Name),l.a.createElement("td",null,e.Domain),l.a.createElement("td",null,e.BreachDate),l.a.createElement("td",null,e.PwnCount)))})))}):null,t.length?l.a.createElement("div",{className:"col s12 m12"},l.a.createElement("div",{className:"card teal accent-3"},l.a.createElement("div",{className:"card-content white-text"},l.a.createElement("span",{className:"card-title"},"Wohoo! no records found for:"),l.a.createElement("i",{className:"material-icons prefix"},"check_circle"),t.split(",").map(function(e,a){return e.length>5?l.a.createElement("p",{key:a},e):null})),l.a.createElement("div",{className:"card-action"},l.a.createElement("button",{className:"waves-effect waves-teal btn-flat teal",onClick:this.closeCard,type:"link"},"CLOSE CARD")))):null)))}}]),a}(n.Component),N=t(87),v=t.n(N),w=function(e){function a(){var e;return Object(d.a)(this,a),(e=Object(E.a)(this,Object(p.a)(a).call(this))).passwordInput=function(a){e.setState({passwordInput:a.target.value})},e.getBreachedPassword=function(){e.setState({passwordNotFound:"2",passwordOutput:"",isLoading:!0});var a=e.state.passwordInput;if(a.length){var t=e.sha1Generator(a).toUpperCase();fetch("https://intense-spire-63761.herokuapp.com/api/password/".concat(t.slice(0,5))).then(function(e){return e.json()}).then(function(a){var n=e.findHash(t,a);if(n&&n.split(":")[1]>0){var l=n.split(":")[1].replace(/\B(?=(\d{3})+(?!\d))/g,",");e.setState({isLoading:!1,passwordOutput:l,passwordNotFound:"0"})}else e.setState({isLoading:!1,passwordNotFound:"1"})}).catch(function(a){a&&e.setState({isLoading:!1,passwordNotFound:"1"})})}else e.setState({isLoading:!1})},e.findHash=function(e,a){return a.split("\r\n").find(function(a){return a.split(":")[0]===e.slice(5)})},e.sha1Generator=function(e){return v.a.createHash("sha1").update(e,"binary").digest("hex")},e.closeCard=function(){e.setState({passwordNotFound:"2"})},e.state={passwordInput:"",passwordOutput:"",passwordNotFound:"2",isLoading:!1},e}return Object(h.a)(a,e),Object(u.a)(a,[{key:"render",value:function(){var e=this.state,a=e.passwordOutput,t=e.passwordNotFound,n=e.isLoading;return l.a.createElement("div",{className:"container"},l.a.createElement("div",{className:"row"},l.a.createElement("div",{className:"col s12 m6"},l.a.createElement("div",{className:"card blue-grey darken-1"},l.a.createElement("div",{className:"card-content white-text"},l.a.createElement("span",{className:"card-title"},"Password"),l.a.createElement("p",null,"Enter your password below to check if it was compromised in a data breach."),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("div",{className:"row"},l.a.createElement("form",{className:"col s12"},l.a.createElement("div",{className:"row"},l.a.createElement("div",{className:"input-field col s11 m11"},l.a.createElement("i",{className:"material-icons prefix"},"confirmation_number"),l.a.createElement("input",{onChange:this.passwordInput,id:"password",type:"password",className:"validate"})))))),l.a.createElement("div",{className:"card-action"},l.a.createElement("button",{className:"waves-effect waves-teal btn-flat",onClick:this.getBreachedPassword,type:"link"},"SEARCH",l.a.createElement("i",{className:"material-icons right"},"send"))))),n?l.a.createElement("div",{className:"progress"},l.a.createElement("div",{className:"indeterminate"})):a.length&&"0"===t?l.a.createElement("div",{className:"col s12 m6"},l.a.createElement("div",{className:"card red darken-1"},l.a.createElement("div",{className:"card-content white-text"},l.a.createElement("span",{className:"card-title"},"Oh! Nooo!"),l.a.createElement("p",null,"Your password was found in ",a," breaches! ",l.a.createElement("i",{className:"material-icons prefix"},"sentiment_very_dissatisfied"))),l.a.createElement("div",{className:"card-action"},l.a.createElement("button",{className:"waves-effect waves-teal btn-flat teal",onClick:this.closeCard,type:"link"},"CLOSE CARD")))):"1"===t?l.a.createElement("div",{className:"col s12 m6"},l.a.createElement("div",{className:"card teal accent-3"},l.a.createElement("div",{className:"card-content white-text"},l.a.createElement("span",{className:"card-title"},"Wohoo!"),l.a.createElement("p",null,"Your password was not found in any breaches! ",l.a.createElement("i",{className:"material-icons prefix"},"sentiment_very_satisfied"))),l.a.createElement("div",{className:"card-action"},l.a.createElement("button",{className:"waves-effect waves-teal btn-flat teal",onClick:this.closeCard,type:"link"},"CLOSE CARD")))):null))}}]),a}(n.Component),g=function(e){function a(){var e;return Object(d.a)(this,a),(e=Object(E.a)(this,Object(p.a)(a).call(this))).username=function(a){e.setState({username:a.target.value})},e.password=function(a){e.setState({password:a.target.value})},e.loginOrSignupToggle=function(){e.setState({loginOrSignup:!e.state.loginOrSignup})},e.handleLogin=function(a){a.preventDefault(),e.setState({comingSoon:!0})},e.state={loginOrSignup:!1,username:"",password:"",isLoading:!1,loggedIn:!1,comingSoon:!1},e}return Object(h.a)(a,e),Object(u.a)(a,[{key:"render",value:function(){var e=this.state,a=e.isLoading,t=e.comingSoon;return l.a.createElement("div",{className:"row"},l.a.createElement("div",{className:"col s12 m4 offset-m4"},l.a.createElement("div",{className:"card"},l.a.createElement("div",{className:"card-action teal lighten-2 white-text"},l.a.createElement("h3",null,"Login Form")),l.a.createElement("div",{className:"card-content"},l.a.createElement("div",{className:"form-field"},l.a.createElement("input",{onChange:this.username,type:"text",id:"username"}),l.a.createElement("label",{htmlFor:"username"},"Username")),l.a.createElement("br",null),l.a.createElement("div",{className:"form-field"},l.a.createElement("input",{onChange:this.password,type:"password",id:"password"}),l.a.createElement("label",{htmlFor:"password"},"Password")),l.a.createElement("br",null),l.a.createElement("div",{className:"switch"},l.a.createElement("label",null,"Login",l.a.createElement("input",{onChange:this.loginOrSignupToggle,type:"checkbox"}),l.a.createElement("span",{className:"lever"}),"Sign Up")),l.a.createElement("br",null),l.a.createElement("div",{className:"form-field"},l.a.createElement("button",{onClick:this.handleLogin,className:"btn-large wave-effect waves-light",style:{width:"100%"}},"Submit")),a?l.a.createElement("div",{className:"progress"},l.a.createElement("div",{className:"indeterminate"})):null))),t?l.a.createElement("div",{className:"col s12 m4 offset-m4"},l.a.createElement("div",{className:"card"},l.a.createElement("div",{className:"card-action teal lighten-2 white-text"},l.a.createElement("p",null,"Thank you for showing an interest in our product."),l.a.createElement("p",null,"This feature is coming soon!")))):null)}}]),a}(n.Component),b=t(188),k=t(187),O=function(){return l.a.createElement(b.a,null,l.a.createElement("div",null,l.a.createElement(i,null),l.a.createElement(k.a,{exact:!0,path:"/pwnedApp",component:o}),l.a.createElement(k.a,{exact:!0,path:"/Email",component:f}),l.a.createElement(k.a,{exact:!0,path:"/Password",component:w}),l.a.createElement(k.a,{exact:!0,path:"/Login",component:g})))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(l.a.createElement(O,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},90:function(e,a,t){e.exports=t(186)},95:function(e,a,t){}},[[90,2,1]]]);
//# sourceMappingURL=main.1091d70b.chunk.js.map