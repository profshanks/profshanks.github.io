---
title: The Data Wrangling Blues
layout: post
post-image: "../assets/images/data_wrangling/DataWranglingBlues_2.png"
description: Sometimes you have to fight to get your high-quality data
tags:
- data wrangling
- web scraping
- collaboration
- self efficacy
---

In an ideal world, those of us working with data would have frictionless access to our data warehouses, and the data engineering behind those troves of data would be modern, efficient, and user friendly. I don't live there either. Here's what I'm doing to get by...

I coordinate a course taken by two-thirds of the students at our university, split across dozens of class sections. To do my job, I need accurate rosters detailing which students are in which sections, along with their email addresses and other details that enable me to circulate surveys and other tools that we use to keep tabs on how the program is going. Obtaining accurate versions of those rosters in a timely fashion has proven challenging over the years, and many different approaches have been used including:
- **_Having faculty send me a copy of their rosters_** (lots of mistakes, inconsistent response times)
- **_Direct data-requests from the folks who run our data-warehouse_** (can take up to a week, we pay a fee for every data pull)
- **_I copy/paste the data from the learning management system using my administrative access privileges_** (Incomplete data, time-consuming & error-prone process)
- **_Collect missing data from student reponses to surveys_** (error-prone, some students don't do the survey)

# The Mission:
What I need is the ability to pull a complete set of data on the students in my program multiple times throughout the semester as they add and drop classes. This is particulary important in the early weeks of the semester when student schedules are the most changeable.

## The Plan:
The good news is that I have access to all of the data, I just don't have the authority to access that data using something efficient like a SQL query. I have to click through page after page after page in the online interface, copying and pasting data as I go into a separate Excel sheet. This is mindless, repetitive, and consequently error-prone. This also happens to be exactly the sort of thing that a web-scraper can do far more accurately and efficiently!

#### Step-By-Step:

**The Tools:** My package of choice for this task is **_Selenium._** One day I will learn to do these sorts of things with Perl, but once again Python lives up to its reputation as the perpetually "good enough" language. Using the Selenium WebDriver I can navigate through all of those same clicks, and collect the desired data along the way into a **_Pandas_** dataframe for later export into an **_Excel_** file. That file can then be used in multiple scripts throughout the semester.
<img src="../assets/images/data_wrangling/selenium_logo.png" align="left" width="200px"/>

**Building the Script:** The majority of the work here involved walking through each page of the interface and inspecting each data field to find the XPath. This allows the WebDriver object to find what I'm looking for. As with most projects, I only wound up needing a small fraction the Selenium's capability. In fact 99% of the work was done with a single method:

<p style="text-align: center;"><strong>cell = driver.find_element(By.XPATH, '//*[@id="EMAIL_LINK$0"]')</strong></p>

A handful of methods called on the "cell" object (.text, .send_keys(), .click(), .get_attribute) covered nearly all of the activity that I was looking for the WebDriver to execute. There were also some nuances involving string slicing that were required to give me the precise format that I needed in my final Excel sheet. Here is one example:

<p style="text-align: center;"><strong>email = str(driver.find_element(By.XPATH, f'//*[@id="EMAIL_LINK${i}"]').get_attribute('href'))[7:]</strong></p>

Here I had to give the WebDriver a heads up that I wanted to scrape the 'href' attribute, and that I wanted it to slice off the first 7 elements ("mailto:") of the string. Otherwise the process of creating the code was just as simplistic and repetitive as it was doing the same activity by hand! 

As each piece of data was scraped, it was added to a dictionary, which was then appended as a new row of a Pandas dataframe. When all of the sections had been scraped, the dataframe was exported as an Excel workbook.

**Squashing the Bugs:** 
Anyone who has ever worked with automated testing software for a browser understands the importance of timing; different pages need different amounts of time to load under a host of varying conditions. Selenium's "WebDriverWait" function can be helpful at times, but more often than not I found myself simply adding calls to time.sleep() to gain greater control. This would be a terrible way to handle this problem if I was trying to set up a fully autonomous protocol, but again my goal was "good data" when and where I needed it. I am not setting up an automated pipeline that other folks are depending upon.

In that same vein, there were moments when Selenium stumbled... appropriately. Getting past our system's Duo security interface was non-trivial, so I simply used Selenium to call for the URL that I wanted, and then I executed the security challenges by hand. Similarly, activities that were only done once, such as entering the desired term and course settings were also done by hand. 

The goal here was to ["Automate the Boring Stuff,"](https://automatetheboringstuff.com) to buoy my morale, and to ensure accuracy. And I needed to accomplish that with a script that could be written in a reasonable amount of time by a non-web-master and then modified later for other purposes. I could probably create a "perfect" script that was 100% reliable, but I would easily double or triple the number of hours spent researching and coding in pursuit of that last 1% of the functionality. I'm doing Data Science, not Web Development; eyes on the prize folks! 

## The Results
It took me a few hours to wrap my head around Selenium for the first time and to learn the nuances of the XML layout of my university's online interface. In fact, It probably took me three times longer to generate that first full roster of all of the sections than it did doing the job by hand the year before. But then the benefits started rolling in:
- The second time I generated the roster, it took minutes. 
- I then generated a fresh roster 4 more times over the next few weeks; accurate data, when I needed it.
- Having accurate and up-to-date data saved me untold minutes from not having to resolve bugs in my data analytics work throughout the semester. This was a MAJOR headache in years past.
- This script formed the basis of several other automated processes that I never knew that I needed! Entering student registration permissions and modifying our course schedules for future semesters are now semi-automated processes with the subsequent benefits of time-savings, fewer mistakes, and increased personal morale.
<br>
<p align="center">
  <img src="../assets/images/data_wrangling/DataVictory_1.png" alt="The Data Scientist Wins..." width="40%" />
</p>
<p align="center">
  <strong><em>Accurate data at last! Such a great feeling...</em></strong>
</p>