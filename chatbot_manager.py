import json
import re    #used for validation of names, phone numbers and emails

# Chatbot Manager

class ChatbotManager:

    # Initialization

    def __init__(self):    

        with open("responses.json", "r", encoding="utf-8") as file:  #load responses.json file
            self.data = json.load(file)   #read the json file

        self.steps = [               #order of conversation
            "website_type",
            "business_name",
            "requirements",
            "budget",
            "name",
            "email",
            "phone"
        ]

        self.current_step = 0   #variable to keep track of which question the chatbot is asking
        self.user_data = {}     #dictionary to store user response for each question

    # Chat Flow

    def start_chat(self):   #function to start a new conveersation

        self.current_step = 0    #reset to first question
        self.user_data = {}

        first_question = self.steps[self.current_step]

        return self.get_question(first_question)

    def get_question(self, key):   #function to get questions from responses.json file

        return self.data["questions"][key]

    def process_message(self, message):   #function to store and validate the user responses

        current_key = self.steps[self.current_step]

        if current_key == "website_type":   #validation for website type

            valid_types = {
                website.lower(): website
                for website in self.data["website_types"]
            }

            # Exact match
            if message.lower() in valid_types:
                message = valid_types[message.lower()]

            else:

                # Smart partial matching
                matched = None

                for website in self.data["website_types"]:

                    website_lower = website.lower()

                    if (
                        message.lower() in website_lower or
                        website_lower.startswith(message.lower())
                    ):
                        matched = website
                        break

                if matched:
                    message = matched
                else:
                    return (
                        "Please enter a valid website type. "
                    )

        elif current_key == "business_name":   #business name validation

            if message.strip() == "":
                return "Business name cannot be empty."

        elif current_key == "requirements":   #requirements validation

            if len(message.strip()) < 10:
                return "Please describe your requirements in at least 10 characters."

        elif current_key == "budget":    #budget validation

            if not message.isdigit() or int(message) <= 0:
                return "Please enter a valid budget."

        elif current_key == "name":  #name validation

            if not re.fullmatch(r"[A-Za-z ]+", message):
                return "Please enter a valid name."

        elif current_key == "email":  #email validation

            if not re.fullmatch(
                r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
                message
            ):
                return "Please enter a valid email address."

        elif current_key == "phone":  #phone number validation

            if not re.fullmatch(r"\d{10}", message):
                return "Please enter a valid 10-digit phone number."

        self.user_data[current_key] = message  #store the answer

        self.current_step += 1 #move to next question

        if self.current_step >= len(self.steps):  #check if all questions are finished

            self.save_user_data()  #store every answer in user_data.json

            return self.data["thank_you"]

        next_key = self.steps[self.current_step]

        return self.get_question(next_key)  

    def reset_chat(self):   #function for refresh button

        self.current_step = 0
        self.user_data = {}

    # Data Management

    def save_user_data(self):  #permanently save answers in user_data.json

        try:

            with open("user_data.json", "r", encoding="utf-8") as file:
                users = json.load(file)

        except FileNotFoundError:

            users = []

        users.append(self.user_data)

        with open("user_data.json", "w", encoding="utf-8") as file:
            json.dump(users, file, indent=4)

    def add_attachment(self, filename, filepath):  #function for file attachments

        if "attachments" not in self.user_data:
            self.user_data["attachments"] = []

        self.user_data["attachments"].append({
            "filename": filename,
            "filepath": filepath
        })