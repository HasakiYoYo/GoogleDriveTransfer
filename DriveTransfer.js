var folder_link = "https://drive.google.com/drive/folders/******************************?usp=sharing";
var drive_name = "YOURTEAMDRIVENAME";
var scriptproperties = PropertiesService.getScriptProperties();

function Main(){
    var folder_uid = folder_link.slice(folder_link.indexOf('folders/') + 8,folder_link.indexOf('?'));
    var team_drive = getTeamDriveByName_(drive_name);

    try {
        var topFolder = DriveApp.getFolderById(folder_uid);

        deletekeys_();
        console.log(topFolder.getName() + "Copy Process Has Started. Please Wait...");
        copy_(topFolder.getName(), topFolder, team_drive);
        console.log(topFolder.getName() + "Folder Has Been Copied Successfully. Please Check Your Google Drive Now.");
    }
    catch (e) {
      console.log(e.toString());
    }
}

function getTeamDriveByName_(name){
    try {
        var TeamDrive = Drive.Teamdrives.list();
        for(var i = 0; i < TeamDrive.items.length; i++) {
            if(TeamDrive.items[i].name === name) {
                var id = TeamDrive.items[i].id;
            }
        }
        return DriveApp.getFolderById(id);
    }
    catch(e) {
        console.log(e);
    }
    return undefined;
}

function deletekeys_() {
    scriptproperties.deleteAllProperties();
}

function copy_(container_name, container, drive){
    var folders = container.getFolders();

    var folder_count = 0;
    while (folders.hasNext()){
        folder_count++;
        var folder = folders.next();
        copyFolder_(container_name, folder, drive);
    }

    var files = container.getFiles();
    var file_count = 0;
    copyFiles_(container, files, drive);
    while (files.hasNext()){
        file_count++;
        var file = files.next();
    }
}

function copyFiles_(container_name, files, drive){    
    if (scriptproperties.getProperty(container_name + "copy")){
        var copy_folder = DriveApp.getFolderById(scriptproperties.getProperty(container_name + "copy"));
        if (!scriptproperties.getProperty(container_name + "files_processed")){
            while (files.hasNext()){
                file = files.next();
                console.log("start to copy " + file.getName() + " ...");
                var copy_file = file.makeCopy(file.getName(), copy_folder);
                console.log("copy " + file.getName() + " finished.")
            }
        }
      }
    else {
        let copy_folder = drive.createFolder(container_name + "");
        var copy_folder_id = copy_folder.getId();

        scriptproperties.setProperty(container_name + "copy", copy_folder_id);

        if (!scriptproperties.getProperty(container_name + "files_processed")) {
            while (files.hasNext()) {
                var file = files.next();
                console.log("start to copy " + file.getName() + " ...");
                var copy_file = file.makeCopy(file.getName(), copy_folder);
                console.log("copy " + file.getName() + " finished.")
            }
        }
    }
    scriptproperties.setProperty(container_name + "files_processed", "true");
}

function copyFolder_(container_name, folder, drive){
    if (scriptproperties.getProperty(container_name + "copy")) {
        var container = DriveApp.getFolderById(scriptproperties.getProperty(container_name + "copy"));
        if (!scriptproperties.getProperty(container_name + folder.getName() + "folder_processed")){
            var copy_folder = container.createFolder(folder.getName()+"");
            var copy_folder_id = copy_folder.getId();
            scriptproperties.setProperty(folder.getName() + "copy", copy_folder_id);

            console.log("start to copy " + folder.getName() + " ...");
            copy_(folder.getName(), folder, copy_folder);
            console.log("copy " + folder.getName() + " finished.")
        }
    }
    else {
        let container = drive.createFolder(container_name + "");
        var container_id = container.getId();
        scriptproperties.setProperty(container_name + "copy", container_id);

        if (!scriptproperties.getProperty(container_name + folder.getName() + "folder_processed")){
            let copy_folder = container.createFolder(folder.getName()+"");
            let copy_folder_id = copy_folder.getId();
            scriptproperties.setProperty(folder.getName() + "copy", copy_folder_id);

            console.log("start to copy " + folder.getName() + " ...");
            copy_(folder.getName(), folder, copy_folder);
            console.log("copy " + folder.getName() + " finished.")}
    }
    scriptproperties.setProperty(container_name + folder.getName() + "folder_processed", "true");
}
