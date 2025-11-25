from dataclasses import dataclass

@dataclass
class TranscriptChunk:
    id: str
    video_id: str
    start_time: float
    end_time: float
    transcript_text: str

    @classmethod
    def from_tuple(cls, row: tuple):
        return cls(*row)