import {app, net, netLog, BrowserWindow, ipcMain} from "electron"
import path from "path"


function createWindow(size: { width: number; height: number; })
{
    const win = new BrowserWindow({
        width: size.width, 
        height: size.height,
        show: false,
        backgroundColor: '#FFFFF',
        webPreferences: {
            preload: path.join(__dirname,'preload.js')
        }
                    }
)


win.loadFile('index.html')

win.once('ready-to-show', () =>{
    win.show()
}
)
}


const windowSize = {width: 1000, height: 900}

app.whenReady().then(async() =>{
    createWindow(windowSize)
    await netLog.startLogging(path.join(__dirname, 'net-log.log'))

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) 
        createWindow(windowSize)
      })
    
})

app.on('before-quit', async () =>{
    const path = await netLog.stopLogging()
    console.log('Net-logs written to', path)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

ipcMain.handle('Auth', async (_, email, pass) => {
    const url = "https://spaces.nexudus.com/api/token";

    const options = {
        method: "POST",
        headers: {
                accept: 'application/json',
                "Content-Type": 'application/x-www-form-urlencoded',
        },
        body: `grant_type=password&username=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`
    }



    try{
    const response = await net.fetch(url, options)

        try
            {
            const json = await response.json()
            return json
            }
        catch(err){
            console.error(err)
            return response
        }
    
    }
    catch (err){
        console.error("Error: "+  err)
        return err
    }

    
})

ipcMain.handle("GetFloorPlans", async (_, Auth) =>{

    const url = "https://spaces.nexudus.com/api/sys/floorplandesks?page=1&size=500"
    const options = {
        method: 'GET',
        headers: {
            authorization: Auth
        }
      }

      try{
        const response = await net.fetch(url, options)
        const json = await response.json()
        
        const floorPlansSearched = json.Records
        const idArray: number[] = []
        floorPlansSearched.forEach((floorPlan) => { 
            idArray.push(floorPlan.Id)
        })
        const fullData = await net.fetch(`https://spaces.nexudus.com/api/sys/floorplandesks/?id[${idArray}]&page=1&size=500`, options)
        const dataJson = await fullData.json()
        console.log('RECORDS', dataJson)
        return dataJson
        }
        catch (err){
            console.error("Error: "+  err)
            return err
        }  

})

ipcMain.handle("UpdateFloorPlan", async(_, record, Auth, date) =>{

    const url = "https://spaces.nexudus.com/api/sys/floorplandesks"

    const data = {
        ...record,
        AvailableFromTime: date,
                }

    const options = {
        method: 'PUT',
        headers: {
                authorization: Auth,
                accept: 'application/json',
                'content-type': 'application/json',
        },
        body: JSON.stringify(data)
    }

    try
    {   
        let response = await net.fetch(url, options)

        if (response.status === 409 || response.status == 429){
            let delay: number = parseInt(response.headers.get('retry-after') as string) * 1000;
            await timeout(delay)
            response = await net.fetch(url, options)
        }
        try
        {
        const json = await response.json()
        // console.log({StatusCode: json.Status, Message: json.Message, Value: json.Value, Success: json.WasSuccessful})
        return json
        }
        catch(err){
            console.error(err)
            return response
        }

    }
    catch(err)
    {

        console.error(err);
        return err

    }

})




function timeout(time: number){
    return new Promise(resolve => setTimeout(resolve, time));
}
