<center><img src="https://raw.github.com/ricardoalcocer/lilacs/master/public/images/retro_flower_1_color_colour_lilac_peace-999px.png" width="200">

<h1>LilACS</h1>

</center>


LilACS (Li'l ACS) is a combiantion of Node.ACS (to expose an API) + ACS (as a data store), that will provide you with an instant API for you mobile or web app.

---
# Installation
---

The steps to get LilACS are:

## 1. Install ACS if you don't already have it: 

```
$ [sudo] npm install acs -g
```

## 2. Login to ACS: 

```
$ acs login
```

## 3. Create ACS App

Go to https://my.appcelerator.com/apps and create an ACS-only app.  Open this app, create an admin user and grab the ACS Key and ACS Secret


## 4. Clone LilACS 

```
$ git clone https://github.com/ricardoalcocer/lilacs.git
```

## 5. Add settings

Open **/lib/lilacs_template.js** and add your ACS Keys and admin user info.  Save this file as **/lib/lilacs.js**

## 6. Launch and turn
* From a terminal, go to your project folder and run it: 

```
$ acs run
```
* Point your browser to http://localhost:8080.  LilACS should be running


---
# Usage
---

Once you have LilACS running, your backend is ready to start receiving requests at http://your_domain:port/api/xxxxx.  

### The basics
Records are added to **datasets**.  Your base url will allways be:

```
http://yourhost/api
```

The next querystring parameter is the **dataset**, so if your **dataset** is employees, your URL will be:

```
http://yourhost/api/employees
```

### Adding records

Records are added via HTTP Post.  Simply post a JavaScript Object in the **data** variable to http://yourhost/api/set.  For example:


Example object:
```
{
	name: 'Ricardo',
	lname: 'Alcocer,
	department: 'Finance'
}
```

To add this record to the employee **dataset**, simply **POST** the data via HTTP.  Data needs to be sent in a variable named **data**.

```
http://yourhost/api/employees/set

```

### Updating records

Updating is similar to Adding, but simply call **/edit** and **POST** the variable **id** along with **data**, id being the id of the record to update.  Your record will be replaced with the newly posted one.

```
http://yourhost/api/employees/edit

```

### Deleting records

To delete simply call **/delete** and **POST** the variable **id**, id being the id of the record to remove.  In case you wish to delete more than one record, sent the variable **ids** instead and all record ids separated by commas.

```
http://yourhost/api/employees/delete

```

## Querying records

Right after adding your first record, a full REST API will be exposed to you to manage the data, in our example located at:

```
http://yourhost/api/employees/get/all
```

**LilACS** exposes the following arguments from the ACS 'query' method:

* where (exposed as get. allows comma-separated list of value-pairs)
* classname (exposed as the first paramenter after /api)
* order (allows comma-separated list of columns and minus sign (-) for inverse sort order)
* page
* per_page
* limit
* skip
* columns (allows comma-separated list of columns to get in your result set)

## Use-cases 

**Get all records from employees where department='Finance'**

```
http://yourhost/api/employees/get/department='Finance'
```
**Get all employees ordered by name**

```
http://yourhost/api/employees/get/all/order/name
```

**Get all employees ordered by name but only the id and name columns**

```
http://yourhost/api/employees/get/all/order/name/columns/id,name
```

**Get all employees where name='Ricardo' and order by creation date descending**

```
http://yourhost/api/employees/name="Ricardo"/order/-created_at
```

**Get all employees where name="Ricardo" and department="Finance" order by creation date descending**

```
http://yourhost/api/employees/name="Ricardo",department="Finance"/order/-created_at
```
Note: Allowed logical operators are: =, >, <, >=, <= and !=

**Pagination : Previous example, but in pages of 10 records each**

```
http://yourhost/api/employees/name='Ricardo'/order/-created_at/per_page/10/page/1
```

**NOTE**
Querystring parameters are value pairs, for example when querying a page, the URL looks like **/page/1**, where page is the variable and 1 is the value.  In case a parameter can receive multiple values, they are separated by commas.

---
# Stuff to-do and in-the-works
---

## Events
Mechanism for adding onSet, onEdit, onValidate, onDelete events.  Initial tests are located in the file **/lib/lilacsevents**.js

## Databrowser
Provide an admin insterface for adminsitering records and events.  Initial tests are located at http://yourhost/admin.

---
# Contribuitors
---

* Ricardo Alcocer

Pull requests are encouraged


---
# License
---

Licensed under the terms of the MIT License | [http://alco.mit-license.org/](http://alco.mit-license.org/)
