
declare global {

    interface Window { fetchRequest: {auth, getFloorPlans,  updateFloorPlan,}, floorPlans, Auth, TypeofAuth: string;}
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

    const loggedInDiv = createElement('div', "flex flex-col text-center space-y-4", "loggedIn")
    const loginTitle = createElement('h1', 'text-4xl font-bold',"",window.TypeofAuth === 'Bearer' ? 'Logged in with Bearer Auth': "Maybe not logged in Idk, might use Basic Auth")
    const amountofFloorplans = createElement('p',  "","",`There are ${window.floorPlans.length} floor plans in the space you are logged into`)
    loggedInDiv.appendChild(loginTitle)
    loggedInDiv.appendChild(amountofFloorplans)
    loginForm.replaceWith(loggedInDiv)

    const updateForm = document.getElementById("updateForm")
    updateForm.setAttribute("class", "flex flex-col space-y-4 mt-4")
 
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
    auth = `Bearer ${loginStatus.access_token}`
    window.TypeofAuth = 'Bearer'
    }
    else {
        console.log("Login Failed, using Basic Auth")
        console.error(loginStatus)
        window.TypeofAuth = 'Basic'
    }

    return auth
    
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











