from chatbot_manager import ChatbotManager

bot = ChatbotManager()

print(bot.get_welcome())

print()

print(bot.get_question("website_type"))

print()

print(bot.get_website_types())

print()

print(bot.get_thank_you())