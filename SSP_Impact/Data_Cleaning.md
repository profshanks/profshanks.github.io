---
title: "SSP Impact Study: Data Cleaning"
layout: page
---
#### Note
Since the data file for this project contains information protected by FERPA, I will not be including the original data files here.


```python
import pandas as pd
from IPython.display import display
import openpyxl
```


```python
filename = 'SSP Query Results Nov 2022_Raw.xlsx'
raw = pd.read_excel(filename, sheet_name = 'Export Worksheet')
print(f'Number of rows, columns {raw.shape}')
raw.columns
```

    Number of rows, columns (745, 36)
    




    Index(['CLASS_TERM_CODE', 'CLASS_TERM_DESCR', 'CLASSES_TAKEN', '1183_GPA',
           '1183_CREDITS', '1189_GPA', '1189_CREDITS', '1193_GPA', '1193_CREDITS',
           '1199_GPA', '1199_CREDITS', '1203_GPA', '1203_CREDITS', '1209_GPA',
           '1209_CREDITS', '1213_GPA', '1213_CREDITS', '1219_GPA', '1219_CREDITS',
           '1223_GPA', '1223_CREDITS', 'EMPLID', 'ENTRY_TERM', 'ENTRY_INSTITUTION',
           'ENTRY_COLLEGE', 'ENTRY_MAJOR', 'DEGREE_TERM', 'DEGREE_INSTITUTION',
           'DEGREE', 'DEG_YEAR_SPAN', 'IR_GENDER', 'IR_ETHNICITY', 'FGEN_STATUS',
           'HS_RANK_PCT', 'COMP_ACT_SCORE', 'TOEFL_TOT_SCORE'],
          dtype='object')



#### Lists for ordered categories:


```python
terms = ['Fall 2018', 'Spr 2019', 'Fall 2019', 'Spr 2020', 'Fall 2020', 'Spr 2021', 'Fall 2021', 'Spr 2022']
entry_terms = ['Fall 2013', 'Fall 2014', 'Fall 2015', 'Fall 2016', 'Fall 2017', 'Fall 2018', 'Fall 2019', 
               'Fall 2020', 'Fall 2021', 'Spring Admit?']
degree_terms = ['Spring 2019', 'Fall 2019', 
                'Spring 2020', 'Fall 2020', 
                'Spring 2021', 'Summer 2021', 'Fall 2021', 
                'Spring 2022', 'Summer 2022']
```

### Task 1: Remove irrelevant columns


```python
raw['TOEFL_TOT_SCORE'].value_counts()
```




    0.0    159
    Name: TOEFL_TOT_SCORE, dtype: int64



- We have 159 0's and 586 nulls. Seems like a column that could go.
- The 'EMPLID' is the closest thing to a primary key here, so I think it should be on the left
- Strategic carriage returns will make the clusters of attributes easier to identify and understand


```python
raw = raw[['EMPLID', 'CLASS_TERM_CODE', 'CLASS_TERM_DESCR', 'CLASSES_TAKEN', 
            '1183_GPA','1183_CREDITS', 
            '1189_GPA', '1189_CREDITS', '1193_GPA', '1193_CREDITS',
            '1199_GPA', '1199_CREDITS', '1203_GPA', '1203_CREDITS', '1209_GPA',
            '1209_CREDITS', '1213_GPA', '1213_CREDITS', '1219_GPA', '1219_CREDITS',
            '1223_GPA', '1223_CREDITS', 
            'ENTRY_TERM', 'ENTRY_INSTITUTION', 'ENTRY_COLLEGE', 'ENTRY_MAJOR', 
            'DEGREE_TERM', 'DEGREE_INSTITUTION', 'DEGREE', 'DEG_YEAR_SPAN', 
            'IR_GENDER', 'IR_ETHNICITY', 'FGEN_STATUS', 
            'HS_RANK_PCT', 'COMP_ACT_SCORE']]
```

#### Added Later...
It is definitely easier to understand what is going on with then null values if I work through Task 2 first. 

But I can't fix those null values after the categories are set. So I had to move the code for Task 3 up higher in the notebook in order to get it to run appropriately. 

### Task 3: Check for null values


```python
raw.isnull().sum()
```




    EMPLID                  0
    CLASS_TERM_CODE         0
    CLASS_TERM_DESCR        0
    CLASSES_TAKEN           0
    1183_GPA              720
    1183_CREDITS          720
    1189_GPA              584
    1189_CREDITS          584
    1193_GPA              529
    1193_CREDITS          529
    1199_GPA              385
    1199_CREDITS          385
    1203_GPA              378
    1203_CREDITS          378
    1209_GPA              295
    1209_CREDITS          295
    1213_GPA              282
    1213_CREDITS          282
    1219_GPA              201
    1219_CREDITS          201
    1223_GPA              244
    1223_CREDITS          244
    ENTRY_TERM             28
    ENTRY_INSTITUTION      28
    ENTRY_COLLEGE          28
    ENTRY_MAJOR            28
    DEGREE_TERM           594
    DEGREE_INSTITUTION    594
    DEGREE                594
    DEG_YEAR_SPAN         594
    IR_GENDER              28
    IR_ETHNICITY           28
    FGEN_STATUS           497
    HS_RANK_PCT            28
    COMP_ACT_SCORE         28
    dtype: int64



Most of this makes sense. The descending number of nulls makes sense & a visual inspection of the Excel sheet shows that this is the appropriate pattern for how we are following the students. That said, there are some null values that appear in a row after a student either drops out or graduates.

The repeated '28' just screams corellation. Let's check on that...


```python
transfers = raw[raw['ENTRY_TERM'].isnull()]
print(f'Remaining rows: {transfers.shape[0]}')
```

    Remaining rows: 28
    


```python
transfers.isnull().sum()
```




    EMPLID                 0
    CLASS_TERM_CODE        0
    CLASS_TERM_DESCR       0
    CLASSES_TAKEN          0
    1183_GPA              28
    1183_CREDITS          28
    1189_GPA              26
    1189_CREDITS          26
    1193_GPA              19
    1193_CREDITS          19
    1199_GPA              20
    1199_CREDITS          20
    1203_GPA              16
    1203_CREDITS          16
    1209_GPA              16
    1209_CREDITS          16
    1213_GPA              13
    1213_CREDITS          13
    1219_GPA              12
    1219_CREDITS          12
    1223_GPA               8
    1223_CREDITS           8
    ENTRY_TERM            28
    ENTRY_INSTITUTION     28
    ENTRY_COLLEGE         28
    ENTRY_MAJOR           28
    DEGREE_TERM           28
    DEGREE_INSTITUTION    28
    DEGREE                28
    DEG_YEAR_SPAN         28
    IR_GENDER             28
    IR_ETHNICITY          28
    FGEN_STATUS           19
    HS_RANK_PCT           28
    COMP_ACT_SCORE        28
    dtype: int64



Yup. If I filter for the rows with a null value for 'ENTRY_TERM,' I also get null values for 'ENTRY_INSTITUTION', 'ENTRY_COLLEGE', 'ENTRY_MAJOR', 'IR_GENDER', 'IR_ETHNICITY', 'HS_RANK_PCT', & 'COMP_ACT_SCORE.'

The question is, what to do about those missing values. It represents <4% of the data pool, so simply dropping those rows is an option, but never the best option...

For the 'ENTRY_TERM' I could fill in the nulls with something like 'Spring Admit?' and then they could breakout into their own category. 

For most of the other attributes, perhaps 'unknown' is a better option. That way when I look at something like ethnicity demographics, they have their own wedge of the pie, and it IS an accurate value for that kind of attribute.


```python
values = {'ENTRY_TERM': 'Spring Admit?', 'ENTRY_INSTITUTION': 'unknown',  'ENTRY_COLLEGE': 'unknown', 'ENTRY_MAJOR': 'unknown', 
          'IR_GENDER': 'unknown', 'IR_ETHNICITY': 'unknown', 'FGEN_STATUS': 'unknown',
          'HS_RANK_PCT': 'unknown', 'COMP_ACT_SCORE': 'unknown'}
raw = raw.fillna(value=values)
raw.isnull().sum()
```




    EMPLID                  0
    CLASS_TERM_CODE         0
    CLASS_TERM_DESCR        0
    CLASSES_TAKEN           0
    1183_GPA              720
    1183_CREDITS          720
    1189_GPA              584
    1189_CREDITS          584
    1193_GPA              529
    1193_CREDITS          529
    1199_GPA              385
    1199_CREDITS          385
    1203_GPA              378
    1203_CREDITS          378
    1209_GPA              295
    1209_CREDITS          295
    1213_GPA              282
    1213_CREDITS          282
    1219_GPA              201
    1219_CREDITS          201
    1223_GPA              244
    1223_CREDITS          244
    ENTRY_TERM              0
    ENTRY_INSTITUTION       0
    ENTRY_COLLEGE           0
    ENTRY_MAJOR             0
    DEGREE_TERM           594
    DEGREE_INSTITUTION    594
    DEGREE                594
    DEG_YEAR_SPAN         594
    IR_GENDER               0
    IR_ETHNICITY            0
    FGEN_STATUS             0
    HS_RANK_PCT             0
    COMP_ACT_SCORE          0
    dtype: int64



### Task 2: Check data types for each column
- Step 1: Display the value types for each column
- Step 2: For each column that is listed as "object," generate a list of the values
- Step 3: If values are categorical, make a list (ordered when possible) and post that above
- Step 4: Convert column to categorical data type


```python
raw.dtypes
```




    EMPLID                  int64
    CLASS_TERM_CODE         int64
    CLASS_TERM_DESCR       object
    CLASSES_TAKEN          object
    1183_GPA              float64
    1183_CREDITS          float64
    1189_GPA              float64
    1189_CREDITS          float64
    1193_GPA              float64
    1193_CREDITS          float64
    1199_GPA              float64
    1199_CREDITS          float64
    1203_GPA              float64
    1203_CREDITS          float64
    1209_GPA              float64
    1209_CREDITS          float64
    1213_GPA              float64
    1213_CREDITS          float64
    1219_GPA              float64
    1219_CREDITS          float64
    1223_GPA              float64
    1223_CREDITS          float64
    ENTRY_TERM             object
    ENTRY_INSTITUTION      object
    ENTRY_COLLEGE          object
    ENTRY_MAJOR            object
    DEGREE_TERM            object
    DEGREE_INSTITUTION     object
    DEGREE                 object
    DEG_YEAR_SPAN         float64
    IR_GENDER              object
    IR_ETHNICITY           object
    FGEN_STATUS            object
    HS_RANK_PCT            object
    COMP_ACT_SCORE         object
    dtype: object




```python
raw['CLASS_TERM_DESCR'].value_counts()
```




    Fall 2019    152
    Fall 2021    112
    Fall 2018    108
    Fall 2020    103
    Spr 2022      81
    Spr 2021      65
    Spr 2020      62
    Spr 2019      62
    Name: CLASS_TERM_DESCR, dtype: int64




```python
print(terms)
raw['CLASS_TERM_DESCR'] = (raw['CLASS_TERM_DESCR']
                           .astype('category')
                           .cat
                           .set_categories(terms, ordered=True)  # 'terms' has been posted above as a list
                          )
raw['CLASS_TERM_DESCR'].dtype
```

    ['Fall 2018', 'Spr 2019', 'Fall 2019', 'Spr 2020', 'Fall 2020', 'Spr 2021', 'Fall 2021', 'Spr 2022']
    




    CategoricalDtype(categories=['Fall 2018', 'Spr 2019', 'Fall 2019', 'Spr 2020',
                      'Fall 2020', 'Spr 2021', 'Fall 2021', 'Spr 2022'],
    , ordered=True)



## Repeat process for other columns that require conversion from "object" to "categorical."

#### 'CLASSES_TAKEN'


```python
raw['CLASSES_TAKEN'].value_counts()
```




    SSP1002-001:A                                 49
    SSP1004-001:A                                 48
    SSP1002-002:A                                 37
    SSP1001-001:A                                 32
    SSP1002-003:A                                 31
                                                  ..
    SSP1001-003:A,SSP1004-003:A                    1
    SSP1004-002:B-                                 1
    SSP1001-003:B,SSP1002-003:B                    1
    SSP1001-001:B+,SSP1002-001:B,SSP1004-001:A     1
    SSP1002-001:C-                                 1
    Name: CLASSES_TAKEN, Length: 180, dtype: int64



This one is complicated... Probably screams to be broken out into multiple columns during feature engineering. We have section numbers here, so a little research should make it possible to determine which 5-week session the class was held in. That might make for some interesting perspectives regarding which 5-week sessions work better or have different impacts/advantages. I think I'm going to leave this one alone for now.

#### 'ENTRY_TERM'


```python
nulls = raw['ENTRY_TERM'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['ENTRY_TERM'].value_counts()
```

    There are 0 null values in this column.
    




    Fall 2018        206
    Fall 2019        158
    Fall 2020        137
    Fall 2021        127
    Fall 2017         51
    Spring Admit?     28
    Fall 2016         25
    Fall 2015          9
    Fall 2014          3
    Fall 2013          1
    Name: ENTRY_TERM, dtype: int64



Interesting that all of the entry terms are listed as Fall semesters. There are 28 nulls, so I am guessing that most of those are Spring admits. A lot of those rows point to a Spring semester for the first credits/GPA data as well. We really are a school in which transfer students are treated as an afterthought... :(


```python
print(entry_terms)
raw['ENTRY_TERM'] = (raw['ENTRY_TERM']
                           .astype('category')
                           .cat
                           .set_categories(entry_terms, ordered=True)  # 'entry_terms' has been posted above as a list
                          )
# raw['ENTRY_TERM'].dtype
```

    ['Fall 2013', 'Fall 2014', 'Fall 2015', 'Fall 2016', 'Fall 2017', 'Fall 2018', 'Fall 2019', 'Fall 2020', 'Fall 2021', 'Spring Admit?']
    

#### 'ENTRY_INSTITUTION'


```python
nulls = raw['ENTRY_INSTITUTION'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['ENTRY_INSTITUTION'].value_counts()
```

    There are 0 null values in this column.
    




    UMNDL      715
    unknown     28
    UMNTC        2
    Name: ENTRY_INSTITUTION, dtype: int64



Exacty 28 null values again seems like more than just a coincidence, and if you skim around in the Excel sheet, all of the rows with a null for 'ENTRY_TERM' are also blank for the next three cells as well. No need to order this data, or to create a list for that matter.


```python
raw['ENTRY_INSTITUTION'] = (raw['ENTRY_INSTITUTION']
                           .astype('category')
                          )
# raw['ENTRY_INSTITUTION'].dtype
```

#### 'ENTRY_COLLEGE'


```python
nulls = raw['ENTRY_COLLEGE'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['ENTRY_COLLEGE'].value_counts()
```

    There are 0 null values in this column.
    




    CAHSS      239
    CEHSP      191
    SCSE       187
    LSBE        65
    SFA         33
    unknown     28
    CSE          1
    CLA          1
    Name: ENTRY_COLLEGE, dtype: int64



CLA & CSE are likely references to those schools at the UMTC campus; those numbers would match the numbers above. No reason to create a list or order these categories either.


```python
raw['ENTRY_COLLEGE'] = (raw['ENTRY_COLLEGE']
                           .astype('category')
                          )
 ##raw['ENTRY_COLLEGE'].dtype
```

#### 'ENTRY_MAJOR'


```python
pd.set_option('display.max_rows', None)
nulls = raw['ENTRY_MAJOR'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['ENTRY_MAJOR'].value_counts()
```

    There are 0 null values in this column.
    




    Undeclared                        161
    Pre Business                       58
    Communication B A                  28
    Biology B S                        28
    Pre Psychology                     28
    unknown                            28
    Biology B A                        26
    Psychology                         25
    Criminology B A                    23
    Computer Science B S               18
    Enviro, Sustain & Geog B A         16
    Pre Integr Elem and Spec Ed        15
    Exercise Rehab Sci B A Sc          15
    Pre Law                            12
    Political Science B A              11
    Mechanical Engineering             11
    Pre Studio Art                     10
    Pre Mechanical Engineering          9
    Environmental Science B S           8
    Chemical Engineering                8
    Theatre B A                         8
    Studio Art                          8
    Biochemistry B S                    7
    Pre Social Work                     7
    Social Work                         7
    English B A                         6
    Pre Public Health                   6
    Public Hlth                         6
    Pre Undeclared Engineering          5
    Pre Accounting                      5
    Pre Civil Engineering               5
    Music Education B Mus               5
    Mathematics B S                     5
    Journalism B A                      5
    Stats & Actuarial Science B S       4
    Envtl Outdoor Educ B A Sc           4
    Integr Elem and Spec Ed             4
    Pre Physical Education              4
    Chemistry B S                       4
    Graphic Design                      4
    Pre Graphic Design                  4
    Pre Communication Sci/Disorder      4
    Civil Engineering B S C E           3
    Electrical Engineering              3
    Geological Sciences B S             3
    Writing Studies B A                 3
    Biochemistry B A                    3
    Pre Art                             3
    Pre Undeclared Science              3
    Pre Teaching Communic Arts/Lit      3
    Theatre B F A                       3
    History B A                         3
    International Studies B A           3
    Civil Engineering                   2
    Pre Teaching German                 2
    Mechanical Engineering B S M E      2
    Chinese Area Studies B A            2
    Sociology B A                       2
    Early Childhood B A Sc              2
    Linguistics B S                     2
    Accounting                          2
    Philosophy B A                      2
    Physics B S                         2
    Pre Engineering Physics             2
    Music B A                           2
    Communication Sci/Disorders         2
    Cultural Entrepreneurship B A       2
    Music                               2
    Teaching Social Studies             2
    Engineering Physics                 2
    Computer Science B A                2
    Pre Teaching Mathematics            1
    Theory/Composition B Mus            1
    Electrical Engr B S E E             1
    Industrial Engineering              1
    Teaching Mathematics                1
    Performance B Mus                   1
    Pre Unified Early Childhd Stud      1
    German Studies B A                  1
    Lower Division                      1
    American Indian Studies B A         1
    Art                                 1
    Physics B A                         1
    Pre Chemical Engineering            1
    Pre Teaching Social Studies         1
    Teaching Spanish                    1
    Anthropology B A                    1
    Environment Sustainability B A      1
    Pre Music                           1
    Teaching Communic Arts/ Litera      1
    French Studies B A                  1
    Jazz Studies B Mus                  1
    Name: ENTRY_MAJOR, dtype: int64



That's A LOT of Undeclared students. I wonder if there is a pattern between the huge number of undeclared and the credit-status when they take the course. Are they being advised into these courses immediately over the summer if they are undeclared? Are undeclared students using these courses as part of their soul-searching? 
 
No reason to create a list or order these categories either.


```python
pd.reset_option('max_rows')
raw['ENTRY_MAJOR'] = (raw['ENTRY_MAJOR']
                      .astype('category')
                          )
# raw['ENTRY_MAJOR'].dtype
```

#### 'DEGREE_TERM'


```python
nulls = raw['DEGREE_TERM'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['DEGREE_TERM'].value_counts()
```

    There are 594 null values in this column.
    




    Spring 2022    64
    Spring 2021    37
    Fall 2021      18
    Spring 2020    10
    Summer 2022     7
    Fall 2020       6
    Fall 2019       4
    Spring 2019     3
    Summer 2021     2
    Name: DEGREE_TERM, dtype: int64



594 null values speaks to the fact that we serve A Lot of first-year students, and this query only goes back about 4 years. The vast majority of our students are still on campus.

Interesting that there is no consistency in "The System" about things like "Spring 2021" vs "Spr 2021"

Ordered category seems appropriate here.


```python
print(degree_terms)
raw['DEGREE_TERM'] = (raw['DEGREE_TERM']
                           .astype('category')
                           .cat
                           .set_categories(degree_terms, ordered=True)  # 'entry_terms' has been posted above as a list
                          )
#raw['DEGREE_TERM'].dtype
```

    ['Spring 2019', 'Fall 2019', 'Spring 2020', 'Fall 2020', 'Spring 2021', 'Summer 2021', 'Fall 2021', 'Spring 2022', 'Summer 2022']
    

#### 'DEGREE_INSTITUTION'


```python
nulls = raw['DEGREE_INSTITUTION'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['DEGREE_INSTITUTION'].value_counts()
```

    There are 594 null values in this column.
    




    UMNDL    143
    UMNTC      8
    Name: DEGREE_INSTITUTION, dtype: int64



Again, not many of our students have had a chance to graduate yet. Interesting that so few transfer to UMTC considering how many of my first-year students claim that as their plan.

No reason to create a list or order these categories.


```python
raw['DEGREE_INSTITUTION'] = (raw['DEGREE_INSTITUTION']
                      .astype('category')
                          )
#raw['DEGREE_INSTITUTION'].dtype
```

#### 'DEGREE'


```python
nulls = raw['DEGREE'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['DEGREE'].value_counts()
```

    There are 594 null values in this column.
    




    B A        59
    B A Sc     29
    B B A      23
    B S        20
    B Acc       6
    B S W       5
    B S E E     3
    B F A       2
    B S M E     2
    B Mus       1
    B A A       1
    Name: DEGREE, dtype: int64



No reason to create a list or order these categories.


```python
raw['DEGREE'] = (raw['DEGREE']
                      .astype('category')
                          )
#raw['DEGREE'].dtype
```

#### 'IR_GENDER'


```python
nulls = raw['IR_GENDER'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['IR_GENDER'].value_counts()
```

    There are 0 null values in this column.
    




    F          411
    M          306
    unknown     28
    Name: IR_GENDER, dtype: int64



A LOT more women in these classes relative to men. Should not be a shock...

No reason to create a list or order these categories.


```python
raw['IR_GENDER'] = (raw['IR_GENDER']
                      .astype('category')
                          )
#raw['IR_GENDER'].dtype
```

#### 'IR_ETHNICITY'


```python
nulls = raw['IR_ETHNICITY'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['IR_ETHNICITY'].value_counts()
```

    There are 0 null values in this column.
    




    White         530
    Asian          53
    Hispanic       46
    Black          43
    unknown        28
    Am. Indian     19
    Intl           15
    Unknown        10
    Hawaiian        1
    Name: IR_ETHNICITY, dtype: int64



It would definitely be interesting to see how these numbers compare to campus averages.

No reason to create a list or order these categories.


```python
raw['IR_ETHNICITY'] = (raw['IR_ETHNICITY']
                      .astype('category')
                          )
#raw['IR_ETHNICITY'].dtype
```

#### 'FGEN_STATUS'


```python
nulls = raw['FGEN_STATUS'].isnull().sum()
print(f'There are {nulls} null values in this column.')
raw['FGEN_STATUS'].value_counts()
```

    There are 0 null values in this column.
    




    unknown    497
    FGEN       248
    Name: FGEN_STATUS, dtype: int64



Again, it would be interesting to see how these numbers compare to campus averages.

No reason to create a list or order these categories.


```python
raw['FGEN_STATUS'] = (raw['FGEN_STATUS']
                      .astype('category')
                          )
#raw['FGEN_STATUS'].dtype
```

#### Freshly revised data types!


```python
raw.dtypes
```




    EMPLID                   int64
    CLASS_TERM_CODE          int64
    CLASS_TERM_DESCR      category
    CLASSES_TAKEN           object
    1183_GPA               float64
    1183_CREDITS           float64
    1189_GPA               float64
    1189_CREDITS           float64
    1193_GPA               float64
    1193_CREDITS           float64
    1199_GPA               float64
    1199_CREDITS           float64
    1203_GPA               float64
    1203_CREDITS           float64
    1209_GPA               float64
    1209_CREDITS           float64
    1213_GPA               float64
    1213_CREDITS           float64
    1219_GPA               float64
    1219_CREDITS           float64
    1223_GPA               float64
    1223_CREDITS           float64
    ENTRY_TERM            category
    ENTRY_INSTITUTION     category
    ENTRY_COLLEGE         category
    ENTRY_MAJOR           category
    DEGREE_TERM           category
    DEGREE_INSTITUTION    category
    DEGREE                category
    DEG_YEAR_SPAN          float64
    IR_GENDER             category
    IR_ETHNICITY          category
    FGEN_STATUS           category
    HS_RANK_PCT             object
    COMP_ACT_SCORE          object
    dtype: object



### Task 4: Check for complete range

This would be the place to examine the incompleteness of the "prior semester" data. Not sure what that looks like. Why '0' credits for some of these things, etc.


```python

```

### Task 5: Check for duplicates, gaps, & other obvious errors


```python
raw['EMPLID'].value_counts()
```




    5089622    3
    5476031    3
    4971746    2
    5532551    2
    5485992    2
              ..
    5454197    1
    5477530    1
    5499255    1
    5547384    1
    5580798    1
    Name: EMPLID, Length: 703, dtype: int64




```python
observations = raw['EMPLID'].shape[0]
print(f'Number of rows in dataset: {observations}')
unique = raw['EMPLID'].nunique()
print(f'Unique students: {unique}')
```

    Number of rows in dataset: 745
    Unique students: 703
    


```python
counts = raw['EMPLID'].value_counts()
counts.value_counts()
```




    1    663
    2     38
    3      2
    Name: EMPLID, dtype: int64



Students coming back to these classes for a second semester only represents 42 of the rows in the data set. Two students came back for third semesters, and the other 38 came back for a second.

I will have to figure out how to calculate the FY retention numbers to account for this. Does it raise/lower this figure?

#### Fix issue with duplicates

Let's look at how the duplicates line up in terms of term-based data...


```python
# Creates list of student ID's that are appearing for the second/third time
dups = raw[raw['EMPLID'].duplicated()]
dups = dups.sort_values('EMPLID')
dup_list = list(dups['EMPLID'])
print(dup_list)
```

    [4971746, 5089622, 5089622, 5243134, 5257071, 5276255, 5336652, 5355463, 5394290, 5438678, 5440836, 5442371, 5448077, 5458424, 5470016, 5475078, 5476031, 5476031, 5478001, 5478038, 5478416, 5479609, 5485992, 5524804, 5531693, 5532551, 5539042, 5542114, 5563080, 5570592, 5612997, 5623192, 5629500, 5631260, 5646547, 5648186, 5656576, 5689180, 5705943, 5722218, 5743115, 8003330]
    


```python
pd.set_option('display.max_rows', None)
```


```python
# Creates new df using the above list as a filter. Then only look at term data. Then sort by ID to line things up
multiples = raw[raw['EMPLID'].isin(dup_list)]
multiples = multiples[['EMPLID', '1189_GPA','1189_CREDITS', '1193_GPA', '1193_CREDITS',
                 '1199_GPA', '1199_CREDITS', '1203_GPA', '1203_CREDITS', 
                 '1209_GPA', '1209_CREDITS', '1213_GPA', '1213_CREDITS', 
                 '1219_GPA', '1219_CREDITS', '1223_GPA', '1223_CREDITS']]

multiples = multiples.sort_index().sort_values('EMPLID', kind='mergesort')
print(multiples.shape)
#display(multiples)
```

    (82, 17)
    


```python
pd.reset_option('max_rows')
```

Okay, so it would appear that the data is fairly well behaved here. Every time an repeated EMPLID appears, the data follows inline with what was being tracked higher up in the data frame.

**For the purposes of doing term-based analysis, the lines containing duplicated EMPLID numbers can be safely ingnored.**


```python
raw.to_csv('Cleaner_Data.csv')
```
