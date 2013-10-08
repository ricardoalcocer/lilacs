<center><img src="https://raw.github.com/ricardoalcocer/lilacs/master/public/images/retro_flower_1_color_colour_lilac_peace-999px.png" width="200">

<h1>LilACS</h1>

</center>


LilACS (Li'l ACS) is a combiantion of Node.ACS (to expose an API) + ACS (as a data store), that will provide you with an instant API for you mobile or web app.

## Installation

The steps to get LilACS are:

* Install ACS if you don't already have it: 

```
[sudo] npm install acs -g
```
* Login to ACS: 

```
acs login
```
* Create an ACS project: 

```
acs new project_name
```

* Clone this repo and drop it inside your new ACS project folder, replacing the default files

* Go to **my.appcelerator.com** and open your ACS project

* Create a new **admin user**

* On your ACS project folder, open **/lib/lilacs_template.js** and add your ACS 
Keys and admin user info.  Save this file as **/lib/lilacs.js**

* From a terminal, go to your project folder and run it: **acs run**


## Usage
LilACS is designed with simplicity in mind.  Once you have LilACS running, your backend is ready to start receiving requests at http://your_domain/api/xxxxx.  When testing, ACS will give you the local URL and port.  When published, ACS also gives you a URL, but you can assign a CNAME to an existing domain and point it to your NodeACS app.  

When adding records, each will be part of a data collection, which is specified at the moment of posting it.  Right after adding your first record, a full REST API will be exposed to you to manage the data.

## API
** LilACS ** exposes the following arguments from the ACS 'query' method:

* where (exposed as get. allows comma-separated list of value-pairs)
* classname (exposed as the first paramenter after /api)
* order (allows comma-separated list of columns and minus sign (-) for inverse sort order)
* page
* per_page
* limit
* skip

There's only one simple rule to creating a LilACS URL, and that is that they are value pairs.  

## Use-cases 

** Get all records from employees where department='Finance' **

```
http://yourhost/api/employees/get/department='Finance'
```
** Get all employees ordered by name **

```
http://yourhost/api/employees/get/all/order/name
```

** Get all employees where name='Ricardo' and order by creation date descending **

```
http://yourhost/api/employees/name='Ricardo'/order/-created_at
```

** Get all employees where name='Ricardo' and department='Finance' order by creation date descending **

```
http://yourhost/api/employees/name='Ricardo',department='Finance'/order/-created_at
```


** Pagination : Previous example, but in pages of 10 records each **

```
http://yourhost/api/employees/name='Ricardo'/order/-created_at/per_page/10/page/1
```

### That's that for now

