from gapipy import Client
import json

# Initialize the client with your application key
client = Client(application_key='live_81133e110ae65a4df5a69f4101cb8d08ae83d374')

# Retrieve a specific tour dossier by its ID
tour_dossier = client.tour_dossiers.get(21346)

# Convert the TourDossier object to a dictionary
tour_data_dict = tour_dossier.to_dict()

# Convert the dictionary to JSON format for easy readability
tour_data_json = json.dumps(tour_data_dict, indent=4)

# Print the formatted JSON data
print(tour_data_json)



# skedgo api  : d0d350918956fe2de78a42ccfc85733b