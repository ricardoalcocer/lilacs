# LilACS - Li'l ACS - Work in progress

Li'l ACS is a combiantion of Node.ACS (to expose an API) + ACS (as a data store), that will provide you with an instant API for you mobile or web app.

## Installation

The steps to get LilACS are:

1. Install ACS if you don't already have it: **[sudo] npm install acs -g**
2. Login to ACS: **acs login**
3. Create an ACS project: **acs new project_name**
4. Clone this repo and drop it inside your new ACS project folder, replacing the default files
5. Go to **my.appcelerator.com** and open your ACS project
6. Create a new admin user
7. On your ACS project folder, open **/lib/lilacs_template.js** and add your ACS Keys and admin user info.  Save this file as **/lib/lilacs.js**
8. From a terminal, go to your project folder and run it: **acs run**


## Usage
LilACS is designed with simplicity in mind.  Once you have LilACS running, your backend is ready to start receiving requests at http://your_domain/api/xxxxx.  When testing, ACS will give you the local URL and port.  When published, ACS also gives you a URL, but you can assign a CNAME to an existing domain and point it to your NodeACS app.  

When adding records, each will be part of a data collection, which is specified at the moment of posting it.  Right after adding your first record, a full REST API will be exposed to you to manage the data.

## API
---

### Add Records

<table>
    <tr>
        <td><b>API Call</b></td>
        <td><b>Method</b></td>
        <td><b>Description</b></td>
        <td><b>Status</b></td>
    </tr>
        <tr>
        <td>/api/collection_name/set</td>
        <td align="center">POST</td>
        <td>Receives variables collection and data</td>
        <td align="center">Implemented</td>
    </tr>
        <tr>
        <td>/api/collection_name/get</td>
        <td align="center">GET</td>
        <td>Returns a JSON array with all records in specified collection </td>
        <td align="center">Implemented</td>
    </tr>
        <tr>
        <td>/api/collection_name/get/rec_id</td>
        <td align="center">GET</td>
        <td>Returns specified record as a JSON string</td>
        <td align="center">Proposed</td>
    </tr>
        <tr>
        <td>/api/collection_name/get-sorted/sort_column</td>
        <td align="center">GET</td>
        <td>Returns a JSON array with all records in collection sorted by the specified key</td>
        <td align="center">Proposed</td>
    </tr>
        <tr>
        <td>/api/collection_name/edit/rec_id</td>
        <td align="center">POST</td>
        <td>Receives variable **data** as JSON string</td>
        <td align="center">Proposed</td>
    </tr>
        <tr>
        <td>/api/collection_name/delete/</td>
        <td align="center">POST</td>
        <td>Deletes rec_id</td>
        <td align="center">Proposed</td>
    </tr>
</table>


### That's that for now

