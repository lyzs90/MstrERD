
# Pretty schema diagrams for MicroStrategy

This notebook demonstrates how to convert the generally unhelpful MicroStrategy schema into human-readable JSON. We can then use a diagramming library such as JointJS or GoJS to draw aesthetically pleasing entity relationship diagrams. 

### Export MicroStrategy project schema

We will use the schema from the MicroStrategy Tutorial. The schema can be obtained in Developer from 'Schema' > 'Export Project Schema'. Export the Table Catalog - Logical View which contains a list of all warehouse tables and their attributes and facts.


```python
from pyexcel_xls import get_data
import json

data = get_data("schema.xls")
logical_view = data["Logical View"]
temp = [[item[0], item[1], item[2]] for item in logical_view]
```

    WARNING *** OLE2 inconsistency: SSCS size is 0 but SSAT size is non-zero
    


```python
import pandas as pd
df = pd.DataFrame(temp[1:], columns = logical_view[0])
df.head(10)
```




<div>
<table border="0" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Table Name</th>
      <th>Object</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>CITY_CTR_SLS</td>
      <td>Call Center</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>1</th>
      <td>CITY_CTR_SLS</td>
      <td>Customer City</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>2</th>
      <td>CITY_CTR_SLS</td>
      <td>Cost</td>
      <td>Fact</td>
    </tr>
    <tr>
      <th>3</th>
      <td>CITY_CTR_SLS</td>
      <td>Profit</td>
      <td>Fact</td>
    </tr>
    <tr>
      <th>4</th>
      <td>CITY_CTR_SLS</td>
      <td>Revenue</td>
      <td>Fact</td>
    </tr>
    <tr>
      <th>5</th>
      <td>CITY_CTR_SLS</td>
      <td>Units Sold</td>
      <td>Fact</td>
    </tr>
    <tr>
      <th>6</th>
      <td>CITY_CTR_SLS</td>
      <td>Gross Revenue</td>
      <td>Fact</td>
    </tr>
    <tr>
      <th>7</th>
      <td>CITY_MNTH_SLS</td>
      <td>Month</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>8</th>
      <td>CITY_MNTH_SLS</td>
      <td>Customer City</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>9</th>
      <td>CITY_MNTH_SLS</td>
      <td>Cost</td>
      <td>Fact</td>
    </tr>
  </tbody>
</table>
</div>



### Node list


```python
# form node list

graph_spec = {"nodes": [], "links": []}

df2 = df["Table Name"].drop_duplicates()

for table_id in df2:
    props_list = []
    temp = pd.DataFrame()
    temp = df[df["Table Name"] == table_id]
    for index, row in temp.iterrows():
        props_list.append(row["Object"])
    graph_spec["nodes"].append({"id": table_id, "props": props_list})
```

### Edge List


```python
# cartesian product to find possible edges
df3 = pd.merge(df, df, how='left', on='Object')

# drop rows if Type eq Fact because can't join on Facts
df3 = df3[df3.Type_x != "Fact"]

# drop rows if same Table Name because it is a duplicate record
df3 = df3[df3["Table Name_x"] != df3["Table Name_y"]]

df3.head(10)
```




<div>
<table border="0" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Table Name_x</th>
      <th>Object</th>
      <th>Type_x</th>
      <th>Table Name_y</th>
      <th>Type_y</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>CITY_CTR_SLS</td>
      <td>Call Center</td>
      <td>Attribute (K)</td>
      <td>DAY_CTR_SLS</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>2</th>
      <td>CITY_CTR_SLS</td>
      <td>Call Center</td>
      <td>Attribute (K)</td>
      <td>F_TUTORIAL_TARGETS</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>3</th>
      <td>CITY_CTR_SLS</td>
      <td>Call Center</td>
      <td>Attribute (K)</td>
      <td>ITEM_CCTR_MNTH_SLS</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>4</th>
      <td>CITY_CTR_SLS</td>
      <td>Call Center</td>
      <td>Attribute (K)</td>
      <td>LU_CALL_CTR</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>5</th>
      <td>CITY_CTR_SLS</td>
      <td>Call Center</td>
      <td>Attribute (K)</td>
      <td>LU_EMPLOYEE</td>
      <td>Attribute</td>
    </tr>
    <tr>
      <th>6</th>
      <td>CITY_CTR_SLS</td>
      <td>Call Center</td>
      <td>Attribute (K)</td>
      <td>SUBCATEG_MNTH_CTR_SLS</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>8</th>
      <td>CITY_CTR_SLS</td>
      <td>Customer City</td>
      <td>Attribute (K)</td>
      <td>CITY_MNTH_SLS</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>9</th>
      <td>CITY_CTR_SLS</td>
      <td>Customer City</td>
      <td>Attribute (K)</td>
      <td>CITY_SUBCATEG_SLS</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>10</th>
      <td>CITY_CTR_SLS</td>
      <td>Customer City</td>
      <td>Attribute (K)</td>
      <td>LU_CUST_CITY</td>
      <td>Attribute (K)</td>
    </tr>
    <tr>
      <th>11</th>
      <td>CITY_CTR_SLS</td>
      <td>Customer City</td>
      <td>Attribute (K)</td>
      <td>LU_CUSTOMER</td>
      <td>Attribute</td>
    </tr>
  </tbody>
</table>
</div>




```python
# only keep unique pairs of nodes

unique_pairs = set()
temp = []
for index, row in df3.iterrows():
    if ((row[0], row[3]) in unique_pairs):
        pass
    else:
        unique_pairs.add((row[0], row[3]))
        temp.append(row)
        
df4 = pd.DataFrame(temp)

for index, row in df4.iterrows():
    graph_spec["links"].append({"source": row[0], "target": row[3]})
```

### Export JSON


```python
import json

with open('data.json', 'w') as f:
    json.dump(graph_spec, f)
```
