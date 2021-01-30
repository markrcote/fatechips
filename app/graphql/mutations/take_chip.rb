module Mutations
  class TakeChip < BaseMutation
    argument(:player_id, ID, required: true)

    field(:chip_type, String, null: false)
    field(:game, Types::GameType, null: false)
    field(:errors, [String], null: false)

    def resolve(player_id:)
      authorize_user
      player = Player.find(player_id)
      chip_count = player.take_chip
      {
        chip_type: chip_count.chip_type,
        game: player.game,
        errors: []
      }
    end
  end
end
