
declare global {

    interface Window { fetchRequest: {auth, getFloorPlans,  updateFloorPlan};}
}

type JsonResponse ={
    access_token?: string,
    token_type: string,
    error_description: string
    error?: string,
    expires_in: number,
    refresh_token: string,

}

const updateForm = document.querySelector('form')

updateForm.addEventListener("submit", async(event) => 
{
    event.preventDefault();

    const updateForm = document.querySelector('form')
    const formData = new FormData(updateForm)

    const formDate = new Date(<string> formData.get('dateBulkStart')).toISOString().split('.')[0]+"Z"
    const formEmail = <string> formData.get('email')
    const formPassword = <string> formData.get('pass')
    console.log("script running")
    console.log(formDate)

    const Auth = await makeRequest(formEmail, formPassword)
    const floorPlans = await getAllFloorPlanDesks(Auth)
    floorPlans.forEach(async (floorPlan) =>{
        try{
        const updateStatus = await updateFloorPlanDeskDate(floorPlan, Auth, formDate)
        console.log(updateStatus)
        }
        catch(err){

            console.log(err)
        }
    })
})



async function makeRequest(email: string, pass: string){
    let auth: string = `Basic "${btoa(email + ":" + pass)}`

    console.log("Logging in...")

    const loginStatus = await authenticate(email, pass)
    if (loginStatus.access_token){
    console.log("Login successful")
    auth = `Bearer ${loginStatus.access_token}`

    }
    else {
        console.log("Login Failed, using Basic Auth")
        console.error(loginStatus)
    }


    
    return auth
    
}

async function authenticate(email:string, pass:string) {
    
    const response = await window.fetchRequest.auth(email, pass)
    return response

}


async function getAllFloorPlanDesks(Auth: string) {

    const response = await window.fetchRequest.getFloorPlans(Auth)
    const floorPlans = response.Records
    return floorPlans
    
}


async function updateFloorPlanDeskDate(record, Auth: string, date: string) {

    const response = await window.fetchRequest.updateFloorPlan(record, Auth, date)
    return response

}











