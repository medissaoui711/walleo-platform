"""
Loyalty Engine - مطابق تماماً مع منطق تطبيق Android
القواعد:
- الحد الأقصى 5 طوابع لكل حملة
- كل استرداد: +1 طابع + 100 نقطة
- الطابع السادس: إعادة تعيين إلى 1 + مكافأة 250 نقطة
"""

MAX_STAMPS = 5
POINTS_PER_STAMP = 100
BONUS_POINTS = 250


class RedeemResult:
    def __init__(
        self,
        stamps_count: int,
        max_stamps: int,
        points: int,
        triggered_reward: bool,
        bonus_points_earned: int = 0,
    ):
        self.stamps_count = stamps_count
        self.max_stamps = max_stamps
        self.points = points
        self.triggered_reward = triggered_reward
        self.bonus_points_earned = bonus_points_earned


def process_redeem(current_stamps: int, current_points: int) -> RedeemResult:
    triggered_reward = False
    bonus_earned = 0

    new_stamps = current_stamps + 1
    new_points = current_points + POINTS_PER_STAMP

    if new_stamps > MAX_STAMPS:
        new_stamps = 1
        new_points += BONUS_POINTS
        triggered_reward = True
        bonus_earned = BONUS_POINTS

    return RedeemResult(
        stamps_count=new_stamps,
        max_stamps=MAX_STAMPS,
        points=new_points,
        triggered_reward=triggered_reward,
        bonus_points_earned=bonus_earned,
    )
