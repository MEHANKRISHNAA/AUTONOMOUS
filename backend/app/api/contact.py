from fastapi import APIRouter

from app.schemas import ContactMessageIn, ContactMessageOut
from app.services.contact_store import save_contact_message

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactMessageOut, status_code=201)
def create_contact_message(payload: ContactMessageIn) -> ContactMessageOut:
    message_id = save_contact_message(payload.name, str(payload.email), payload.message)
    return ContactMessageOut(id=message_id)

