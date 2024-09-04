from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
from bs4 import BeautifulSoup
from urllib.request import urlopen
from urllib.parse import quote_plus
from pymongo import MongoClient
import json
from dotenv import load_dotenv
import os
app = Flask(__name__)
CORS(app)
app.config['GEMINI_API_KEY'] = os.getenv('GEMINI_API_KEY')
app.config['DB_LINK'] = os.getenv('DB_LINK')
load_dotenv()
API_KEY = app.config['GEMINI_API_KEY'] 
API_URL = f'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={API_KEY}'

client = MongoClient(app.config['DB_LINK'])
db = client["AiPlans"]
trip_plans_collection = db["Plans"]
user_collection=db["User"]

# def jsoncoverter(){

# }
@app.route('/generator', methods=['POST'])
def generate():
    data = request.json
    
    people_count = data.get('peoplecount')
    start_date = data.get('startdate')
    end_date = data.get('enddate')
    activities = data.get('activities')
    location = data.get('location')
    payload = {
        "contents": [
            {
                "role": "model",
                "parts": [
                    {"text": "You are a helpful assistant."}
                ]
            },
            {
                "role": "user",
                "parts": [
                    {"text": "Please provide a response in JSON format."}
                ]
            },
             {
                "role": "model",
                "parts": [
                    {"text": "Please provide reponse with only correct JSON."}
                ]
            },
            {
                "role": "user",
                "parts": [
                    {"text": f".Hey there! I'm planning a trip to {location} from {start_date} dd/mm/yy to {end_date} for {people_count} people. We're interested in {activities}. Can you help me plan a trip that fits our budget of medium?"}
                ]
            },
            {
                "role": "user",
                "parts": [
                    {"text": """
                    The output should follow this format:
                    {
                        "itinerary": {
                            "days": [
                                {
                                    "activities": [
                                    {
                                        "description": "acivity description",
                                        "location": [latitude,longitude],
                                    },
                                    {
                                        "description": "acivity description",
                                        "location": [latitude,longitude],
                                    },
                                    ]
                                },
                            ],
                            "estimated_cost": {
                                "food": "$ cost",
                                "activities": "$ cost",
                                "transport": "$ cost",
                                "total": "$ cost"
                            }
                        }
                    """},
                ]
            },
        ]
    }
    headers = {
        "Content-Type": "application/json"
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    # ans=jsonconverter(payload,response)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": response.json()}), response.status_code


@app.route('/allhotels', methods=['POST'])
def gethotels():
    data = request.json
    url = API_URL 

    payload = {
    "contents": [
        {
            "role": "model",
            "parts": [
                {"text": "You are a helpful assistant."}
            ]
        },
        {
            "role": "user",
            "parts": [
                {"text": "Please provide a response in JSON format."}
            ]
        },
        {
            "role": "model",
            "parts": [
                {"text": "Please provide reponse with only correct JSON."}
            ]
        },
        {
            "role": "user",
            "parts": [
                {"text": f"Provide me hotels within {data}. At least 3 of each type medium ,luxury and budget adn location of each hotel"}
            ]
        },
        {
            "role": "user",
            "parts": [
                {"text": """
                The output should follow this format:
                {
                    "hotels": [
                        {
                            "name": "Hotel Name",
                            "location": [latitude,longitude],
                            "price_range": "budget or luxury or medium",
                            "estimated_price": "$ cost per night",
                            "star_rating": 3,
                            "amenities": ["Wi-Fi", "Gym", "Swimming Pool"],
                            "reviews": [
                                {
                                    "rating": 4.5,
                                    "comment": "Great hotel with friendly staff."
                                }
                            ]
                        },
                        {
                            "name": "Hotel Name",
                            "location": "[latitude,longitude]",
                            "price_range": "budget or luxury or medium",
                            "estimated_price": "$ cost per night",
                            "star_rating": "3",
                            "amenities": ["Wi-Fi", "Gym", "Swimming Pool"],
                            "reviews": [
                                {
                                    "rating": "4.5",
                                    "comment": "Great hotel with friendly staff."
                                }
                            ]
                        },
                    ]
                }
                """}
            ]
        }
    ]
}


    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)

# Handle the response
    if response.status_code == 200:
        hotels = response.json()
        return hotels
    else:
        return (f"Error: {response.status_code}, {response.text}")

@app.route('/scrapeImages',methods=['POST'])
def imagesearch(): 
    data = request.json
    query = data.get('query')
    encoded_query = quote_plus(query+"hotel")
    # Construct the Google search URL
    search_url = f'https://www.google.com/search?hl=en&tbm=isch&q={encoded_query}'
    htmldata = urlopen(search_url)
    soup = BeautifulSoup(htmldata, 'html.parser')
    images = soup.find_all('img')

    # Extract the image URLs
    image_urls = []
    cnt=0
    for item in images:
        src = item.get('src')
        cnt+=1
        if(cnt==5):
            break
        if src and src.startswith('http'):
            image_urls.append(src)

    # Return the list of image URLs as a JSON response
    return jsonify({"image_urls": image_urls})

@app.route('/api/signup', methods=['POST'])
def createUser():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        user={
                "email": email,
                "password": password,#will implement hashed password
        }
        userfind=user_collection
        user_collection.insert_one(user)
        return jsonify({"message":"success"}),200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/createplan',methods=['POST'])
def createPlan():
    if request.is_json:
        body = request.get_json()
        
        # Access the values using string keys
        user_email = body.get('user_email')
        location_markers = body.get('location_markers')
        activities = body.get('activities')
        trip_plan={
            "email":user_email,
            "markers":location_markers,
            "activities":activities
        }
        trip_plans_collection.insert_one(trip_plan)
        
        return jsonify({"message": "Trip plan created successfully"}), 201
    else:
        return jsonify({"message": "Invalid request format"}), 400


@app.route('/api/plans',methods=['POST'])
def getplans():
    try:
        body = request.json
        plan_id = body.get('id')
        
        # Fetch the plan by ID from MongoDB
        plan = plans_collection.find_one({"_id": ObjectId(plan_id)})
        
        if plan:
            # Convert the MongoDB document to JSON serializable format
            plan['_id'] = str(plan['_id'])
            return jsonify(plan), 200
        else:
            return jsonify({"error": "Plan not found"}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json

    # Extract email and password from the request body
    email = data.get('email')
    password = data.get('password')

    # if not email or not password:
    #     return jsonify({"error": "Email and password are required"}), 400

    # Find the user in the database by email
    user = user_collection.find_one({"email": email})
    if user:
        # Check if the password matches
        if user["password"] == password:
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"error": "Invalid password"}), 401
    else:
        return jsonify({"error": "User not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=8000) 
