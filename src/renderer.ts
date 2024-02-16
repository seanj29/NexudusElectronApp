
declare global {

    interface Window { fetchRequest: {auth, getFloorPlans,  updateFloorPlan,}, floorPlans, Auth:string, Error}
}


const loginForm = document.getElementById('loginForm')
const currentDate = <HTMLInputElement>document.getElementById('date')

currentDate.value = new Date().toISOString().split('T')[0]

loginForm.addEventListener("submit", async(ev) => 
{
    ev.preventDefault();

    const loginForm = <HTMLFormElement>document.getElementById('loginForm')
    const formData = new FormData(loginForm)

    const formEmail = <string> formData.get('email')
    const formPassword = <string> formData.get('pass')

    window.Auth = await makeRequest(formEmail, formPassword)
    window.floorPlans = await getAllFloorPlanDesks(window.Auth)
    const ErrorAlert = document.getElementById("errorAlert")

    console.log(window.Auth)

    if (!window.Auth){
    ErrorAlert.setAttribute("class", "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded")
    const ErrorMessage = document.getElementById("errorMessage")
    ErrorMessage.innerHTML = window.Error
    }
    else
    {
    const loggedInDiv = createElement('div', "flex flex-col text-center space-y-4", "loggedIn")
    const loginTitle = createElement('h1', 'text-4xl font-bold',"",'Logged in')
    const amountofFloorplans = createElement('p',  "","",`There are ${window.floorPlans.length} floor plans in the space you are logged into`)

    loggedInDiv.appendChild(loginTitle)
    loggedInDiv.appendChild(amountofFloorplans)

    ErrorAlert.setAttribute("class", "hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded")
    loginForm.replaceWith(loggedInDiv)
    const updateForm = document.getElementById("updateForm")
    updateForm.setAttribute("class", "flex flex-col space-y-4 mt-4")
    }
})

const updateForm = document.getElementById("updateForm")

updateForm.addEventListener("submit", async (ev) =>{

    ev.preventDefault();
    const updateForm = <HTMLFormElement>document.getElementById('updateForm')
    const formData = new FormData(updateForm)

    const formDate = new Date(<string> formData.get('dateBulkStart')).toISOString().split('.')[0]+"Z"

    const floorPlanList = await Promise.all(window.floorPlans.map(async (floorPlan) =>{
        try{
        const updateStatus = await updateFloorPlanDeskDate(floorPlan, window.Auth, formDate)
        console.log("Message: " +updateStatus.Message)
        return updateStatus.WasSuccessful
        }
        catch(err){

            console.log(err)
        }
    }))

    const successVsFailure = createElement("p", 'text-xl', 'successRate' ,`Out of ${window.floorPlans.length} floor plans ${floorPlanList.filter(Boolean).length} updated successfully`)
    const successRateExists = document.getElementById("successRate")

    if (successRateExists) { 
        successRateExists.replaceWith(successVsFailure) 
    }
    else{
    document.getElementById('mainDiv').appendChild(successVsFailure)
    }
}
)

function createElement(html, cssClass?: string, id?: string, innerText?: string){

    const element = <Element>document.createElement(html)
    if(cssClass) {
        element.setAttribute("class", cssClass)
    }
    if(id){ 
        element.setAttribute("id", id)
    }
    if(innerText){
    element.innerHTML = innerText
    }

    return element
}


async function makeRequest(email: string, pass: string){
    let auth: string = `Basic "${btoa(email + ":" + pass)}`

    console.log("Logging in...")

    const loginStatus = await authenticate(email, pass)
    if (loginStatus.access_token){
    console.log("Login successful")
    window.Error = false
    auth = `Bearer ${loginStatus.access_token}`
    return auth
    }
    else {
        console.log("Login Failed")
        window.Error = loginStatus.error_description
        return
    }

    
}

async function authenticate(email:string, pass:string) {
    
    const response = await window.fetchRequest.auth(email, pass)
    return response

}


async function getAllFloorPlanDesks(Auth: string) {
    console.log("Getting all Floor Plan Desks")
    const response = await window.fetchRequest.getFloorPlans(Auth)
    const floorPlans = response.Records
    console.log("Done")
    return floorPlans
    
}


async function updateFloorPlanDeskDate(record, Auth: string, date: string) {
    console.log(`Trying to update ${record.Name}...` )
    const response = await window.fetchRequest.updateFloorPlan(record, Auth, date)
    return response

}











