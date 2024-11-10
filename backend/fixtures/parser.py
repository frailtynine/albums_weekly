from bs4 import BeautifulSoup
import json
from datetime import datetime
import re
from urllib.parse import urlparse


def is_valid_music_link(url):
    """Check if the URL is from allowed music services."""
    parsed = urlparse(url)
    valid_domains = ['album.link', 'song.link', 'odesli.co']
    return any(domain in parsed.netloc for domain in valid_domains)

def clean_text(text):
    """Clean text by removing excessive whitespace and normalizing line breaks."""
    # Replace <br> and multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    # Remove leading/trailing whitespace
    text = text.strip()
    return text

def parse_telegram_export(html_path, start_date, start_post_id):
    """Parse Telegram channel HTML export and extract album reviews."""
    with open(html_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file.read(), 'html.parser')
    
    # Find all message blocks
    messages = soup.find_all('div', class_='message')
    
    reviews = []
    current_post_id = start_post_id
    start_date = datetime.strptime(start_date, '%Y-%m-%d')
    current_review = None
    
    for message in messages:
        # Get message date
        date_elem = message.find('div', class_='pull_right date details')
        if not date_elem:
            continue
            
        # Parse the date (assuming format like "24.02.2023")
        date_text = date_elem.get('title', '').split()[0]
        try:
            message_date = datetime.strptime(date_text, '%d.%m.%Y')
        except ValueError:
            continue
            
        # Skip messages before start date
        if message_date < start_date:
            continue
        
        # Get message text content
        text_block = message.find('div', class_='text')
        if not text_block:
            continue
        
        # Split content by links
        review_texts = []
        current_text = ""
        current_url = None
        
        # Convert <br> tags to spaces before processing
        for br in text_block.find_all('br'):
            br.replace_with(' ')
        
        # Process all elements in order
        for element in text_block.children:
            if element.name == 'a':
                # If we find a new link and already have content, save the previous review
                if current_url and current_text:
                    review_texts.append((current_url, clean_text(current_text)))
                
                url = element.get('href', '')
                if is_valid_music_link(url):
                    current_url = url
                    current_text = element.get_text() + ' '
                else:
                    # If it's not a valid music link, treat it as regular text
                    if current_text:
                        current_text += element.get_text() + ' '
            else:
                # Add text content
                if current_url:  # Only add text if we have a valid URL
                    text = element.string if element.string else str(element)
                    current_text += text + ' '
        
        # Add the last review if exists
        if current_url and current_text:
            review_texts.append((current_url, clean_text(current_text)))
        
        # Create review objects
        for url, text in review_texts:
            reviews.append({
                'text': text,
                'post_id': current_post_id,
                'is_published': 1,
                'pub_date': message_date.strftime('%Y-%m-%d'),
                'url': url
            })
        
        # Increment post_id for the next message
        if review_texts:  # Only increment if we found reviews
            current_post_id += 1
    
    return reviews

def save_reviews_to_json(reviews, output_path):
    """Save the extracted reviews to a JSON file."""
    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(reviews, file, ensure_ascii=False, indent=4)

def main():
    # Configuration
    html_path = 'ChatExport_2024-10-05/messages.html'  # Replace with your HTML file path
    output_path = 'reviews.json'
    start_date = '2020-08-28'
    start_post_id = 73

    # Parse the HTML and extract reviews
    reviews = parse_telegram_export(html_path, start_date, start_post_id)
    
    # Save to JSON
    save_reviews_to_json(reviews, output_path)
    
    print(f"Processed {len(reviews)} reviews and saved to {output_path}")

if __name__ == "__main__":
    main()