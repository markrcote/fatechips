module Mutations
  class TakeChip < BaseMutation
    argument(:player_id, ID, required: true)

    field(:chip_type, String, null: true)
    field(:game, Types::GameType, null: true)
    field(:errors, [String], null: false)

    def resolve(player_id:)
      authorize_user
      chip_type = nil
      errors = []
      game = nil
      player = Player.find(player_id)
      if player.nil?
        errors.push("couldn't find player")
      else
        game = player.game
        chip_count = player.take_chip
        if chip_count.nil?
          errors.push("failed to take a chip")
        else
          chip_type = chip_count.chip_type
        end
      end

      {
        chip_type: chip_type,
        game: game,
        errors: errors
      }
    end
  end
end
