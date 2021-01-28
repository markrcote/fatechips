module Mutations
  class ReturnChip < BaseMutation
    argument(:player_id, ID, required: true)
    argument(:chip_type, String, required: true)

    field(:chip_count, Types::ChipCountType, null: true)
    field(:game, Types::GameType, null: true)
    field(:errors, [String], null: false)

    def resolve(player_id:, chip_type:)
      authorize_user
      chip_count = nil
      errors = []
      game = nil
      player = Player.find(player_id)
      if player.nil?
        errors.push("couldn't find player")
      else
        game = player.game
        chip_count = player.return_chip(chip_type)
        if chip_count.nil?
          errors.push('failed to return chip')
        end
      end

      {
        chip_count: chip_count,
        game: game,
        errors: errors
      }
    end
  end
end
