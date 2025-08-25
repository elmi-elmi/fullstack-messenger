<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $senderId = $this->faker->randomElement([0,1]);
        if($senderId == 0){
            $senderId = User::where('id', '!=', 1)->inRandomOrder()->first()->id;
            $receiverId = 1;
        }else{
            $receiverId= User::where('id', '!=', 1)->inRandomOrder()->first()->id;
        }

        $groupId = null;

        if($this->faker->boolean(50)){
            $group =  Group::all()->random();
            $senderId = $group->users()->inRandomOrder()->first()->id;
            $receiverId = null;
        }
        return [
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'group_id' => $groupId,
            'message' => $this->faker->realText(200),
            'created_at' => $this->faker->dateTimeBetween('-1 years', 'now'),

        ];
    }
}
