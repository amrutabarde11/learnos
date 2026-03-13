// ─── agents/AgentException.java ──────────────────────────────────────────────
package agents;

public class AgentException extends Exception {
    public AgentException(String msg)                  { super(msg); }
    public AgentException(String msg, Throwable cause) { super(msg, cause); }

    public static final class InsufficientDataException extends AgentException {
        private final int required, found;
        public InsufficientDataException(int required, int found) {
            super("Need %d session(s), found %d.".formatted(required, found));
            this.required = required; this.found = found;
        }
        public int getRequired() { return required; }
        public int getFound()    { return found; }
    }

    public static final class CorruptDataException extends AgentException {
        public CorruptDataException(String field, Object value) {
            super("Corrupt field '%s': value '%s'.".formatted(field, value));
        }
    }
}