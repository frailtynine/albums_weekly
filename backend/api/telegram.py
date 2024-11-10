import logging

import telegram
from telegram.constants import ParseMode
from django.conf import settings


logger = logging.getLogger(__name__)


class Bot():
    def __init__(self, message):
        self.token = settings.TG_BOT_TOKEN
        self.message = message
        self.chat_token = settings.TG_CHANNEL_TOKEN
        logger.info('Bot has been initiated successfully.')

    async def get_info(self):
        bot = telegram.Bot(self.token)
        async with bot:
            await bot.deleteWebhook()

    async def send_message(self):
        bot = telegram.Bot(self.token)
        async with bot:
            await bot.send_message(
                text=self.message,
                chat_id=self.chat_token,
                parse_mode=ParseMode.MARKDOWN)
            logger.info(f'Message {self.message} has been sent.')
